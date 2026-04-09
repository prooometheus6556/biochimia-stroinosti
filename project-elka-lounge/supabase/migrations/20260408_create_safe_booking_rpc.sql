-- =============================================================================
-- book_table_safe — Атомарное бронирование стола с защитой от race conditions
-- =============================================================================
-- ИНСТРУКЦИЯ:
-- 1. Откройте Supabase Dashboard → SQL Editor
-- 2. Выполните этот скрипт один раз
-- 3. После выполнения функция доступна как: book_table_safe(...)
-- =============================================================================

DROP FUNCTION IF EXISTS book_table_safe(
  UUID,
  TIMESTAMPTZ,
  INTEGER,
  VARCHAR,
  VARCHAR,
  INTEGER
);

CREATE OR REPLACE FUNCTION book_table_safe(
  p_table_id          UUID,
  p_arrival_time      TIMESTAMPTZ,
  p_expected_duration_minutes INTEGER,
  p_guest_name        VARCHAR,
  p_guest_phone       VARCHAR,
  p_guests_count      INTEGER  -- информационное поле, не хранится в reservations
)
RETURNS JSONB
LANGUAGE plpgsql
STRICT
AS $$
DECLARE
  v_guest_id          UUID;
  v_reservation_id    UUID;
  v_conflict_exists   BOOLEAN;
BEGIN
  -- ═══════════════════════════════════════════════════════
  -- ШАГ А: Найти гостя по телефону, создать если нет
  -- ═══════════════════════════════════════════════════════
  SELECT id INTO v_guest_id
  FROM guests
  WHERE phone = p_guest_phone
  LIMIT 1;

  IF v_guest_id IS NULL THEN
    INSERT INTO guests (phone, name, is_adult)
    VALUES (p_guest_phone, p_guest_name, true)
    RETURNING id INTO v_guest_id;
  ELSE
    UPDATE guests
    SET name = p_guest_name
    WHERE id = v_guest_id
      AND name IS DISTINCT FROM p_guest_name;
  END IF;

  -- ═══════════════════════════════════════════════════════
  -- ШАГ Б: Заблокировать таблицу — предотвращаем race condition
  -- ═══════════════════════════════════════════════════════
  LOCK TABLE reservations IN SHARE ROW EXCLUSIVE MODE;

  -- ═══════════════════════════════════════════════════════
  -- ШАГ В: Проверка конфликтов
  -- Конфликт = новое бронирование пересекается с активным
  --   с учётом 30-минутного буфера после окончания
  -- ═══════════════════════════════════════════════════════
  SELECT EXISTS (
    SELECT 1
    FROM reservations r
    WHERE r.table_id = p_table_id
      AND r.status NOT IN ('completed', 'cancelled')
      -- новое бронирование заканчивается после начала существующего
      AND (
        p_arrival_time
          + (p_expected_duration_minutes + 30) * INTERVAL '1 minute'
      ) > r.arrival_time
      -- новое бронирование начинается до окончания существующего
      AND p_arrival_time
          < (
            r.arrival_time
            + (r.expected_duration_minutes + 30) * INTERVAL '1 minute'
          )
  ) INTO v_conflict_exists;

  -- ═══════════════════════════════════════════════════════
  -- ШАГ Г: Стол занят — отказ
  -- ═══════════════════════════════════════════════════════
  IF v_conflict_exists THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Стол уже забронирован на это время. Попробуйте выбрать другой стол или время.'
    );
  END IF;

  -- ═══════════════════════════════════════════════════════
  -- ШАГ Д: Стол свободен — создаём бронирование
  -- ═══════════════════════════════════════════════════════
  INSERT INTO reservations (
    guest_id,
    table_id,
    status,
    expected_duration_minutes,
    arrival_time
  )
  VALUES (
    v_guest_id,
    p_table_id,
    'waitlist',
    p_expected_duration_minutes,
    p_arrival_time
  )
  RETURNING id INTO v_reservation_id;

  -- ═══════════════════════════════════════════════════════
  -- Успех — возвращаем данные бронирования
  -- ═══════════════════════════════════════════════════════
  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'id',           v_reservation_id,
      'guest_id',     v_guest_id,
      'table_id',    p_table_id,
      'arrival_time', p_arrival_time
    )
  );

-- ═══════════════════════════════════════════════════════
-- Перехват любых системных ошибок
-- ═══════════════════════════════════════════════════════
EXCEPTION
  WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Ошибка при создании бронирования: ' || SQLERRM
    );
END;
$$;

-- Назначаем владельца и права
ALTER FUNCTION book_table_safe OWNER TO postgres;
GRANT EXECUTE ON FUNCTION book_table_safe TO service_role;
GRANT EXECUTE ON FUNCTION book_table_safe TO authenticated;
GRANT EXECUTE ON FUNCTION book_table_safe TO anon;

COMMENT ON FUNCTION book_table_safe IS
'Безопасное бронирование стола.
Порядок параметров: p_table_id, p_arrival_time, p_expected_duration_minutes, p_guest_name, p_guest_phone, p_guests_count
Возвращает JSONB: {success: bool, data?: {id,guest_id,table_id,arrival_time}, error?: string}';
