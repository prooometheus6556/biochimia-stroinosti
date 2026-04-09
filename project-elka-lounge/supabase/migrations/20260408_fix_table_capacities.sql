-- Migration: Fix table capacities
-- Tables 2 and 11 are small (capacity=2), all others are large (capacity=6)

UPDATE tables SET capacity = 6 WHERE number IN (0, 1, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13);
UPDATE tables SET capacity = 2 WHERE number IN (2, 11);
