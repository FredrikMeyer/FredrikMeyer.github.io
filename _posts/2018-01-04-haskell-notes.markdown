---
layout: post
title:  "Haskell notes"
date:   2018-01-04 22:16:05 +0100
categories: mathematics discrete-optimization knapsack
---
We start with some basic functions.
```haskell
ghci> succ 5
6
ghci> [1,2,3,4] !! 2
3
ghci> [3,4,5] > [2,3]
True
```
Lists are compared lexicographically.

Can use both infix and polish notation:
```haskell
ghci> 4 `elem` [3,4,5]
True
ghci> elem 4 [3,4,5]
True
```
Infinite lists...:
```haskell
ghci> take 10 [1..]
[1,2,3,4,5,6,7,8,9,10]
```
List comprehensions:
```haskell
ghci> [a^2+b^2 | a <- [1..5], b <- [1..5], a^2 `mod` 4 == 1]
[2,5,10,17,26,10,13,18,25,34,26,29,34,41,50]
```

We also have `fst (a,b)` giving `a` and `snd (a,b)` giving `b`.

Can get types:
```haskell
ghci> :t doubleMe
doubleMe :: Num a => a -> a
ghci> :t (==)
(==) :: Eq a => a -> a -> Bool
```

