---
layout: post
published: false
title:  "SICP - Chapter 1"
date:   2018-05-17 23:00:05 +0100
categories: sicp
---

This is my first post summarizing each chapter in [SICP](https://mitpress.mit.edu/sites/default/files/sicp/full-text/book/book-Z-H-4.html).

## Building abstractions with procedures

The first chapter starts with an introduction to the syntax and basics of the Scheme language. The LISP family of languages are inspired by Lambda calculus.

# Expressions and values

Everything in Scheme is an _expression_. There are two types of expressions: _values_ or _compound expressions_, which are values combined using _procedures_ (strictly speaking, we have to explicitly disallow infinite combinations like `(* (* (* (* (* ...`, but this cannot happen on a computer...) 

Values are things like numbers (`1` and `1234.44`), strings (`"Hello, World!"`), procedures (`+` or `/`) or booleans (`#t`, `#f`). These can be combined like so:

```scheme
(+ 1 (* 2 3))
```

Expressions can be evaluated to yield values. Values themselves are _self-evaluating_. The value of a compound expression is given recursively by applying the procedures to values (there always is some expression that consist solely of values). Thus the above line evaluates as follows:

```scheme
(+ 1 (* 2 3)) -> (+ 1 6) -> 7
```

This defines the evaluation model of Scheme.

#  Definitions

Next, in order to reuse values (and to build further abstractions), we have the `define` keyword. It binds the _value_ of an expression to a name. For example:

```scheme
(define pi 3.1415)
```
or
```scheme
(define six (+ 2 4))
```
Note that the name `six` now refers to _value_ `6` and not the expression `(+ 2 4)`.

# Procedures

In order to reuse expressions, we "wrap them in procedures". The syntax is as follows:

```scheme
(define (square x)
    (* x x))
```
Thus the value of the expression `(square 5)` reduces to `(* 5 5)` which reduces to `25`.

This is equivalent to the _lambda_ expression:

```scheme
(define square
    (lambda (x)
        (* x x)))
```

The difference between _applicative order_ and _normal order_ evaluation is discussed. Scheme uses applicative order evaluation, which means that to get the value out of an expression, "operators are applied to operands" first, recursively until a value is returned. In other words, we start with the innermost parenthesis, and works our way out.

On the other hand, normal order evaluation postpones the evaluation of expressions: first all procedures are expanded into primitive procedures to give a long expression consisting solely of primitive procedures. Then the answer is reduces. Contract the two sequences below:

```scheme
(sum-of-squares (+ 1 2) (* 3 4))

(sum-of-squares 3 12)

(+ (square 3) (square 12))

(+ (* 3 3) (* 12 12))

(+ 9 144)

153
```

versus

```scheme
(sum-of-squares (+ 1 2) (* 3 4))

(+ (square (+ 1 2)) (square (* 3 4)))

(+ (* (+ 1 2) (+ 1 2)) (* (* 3 4) (* 3 4)))

(+ (* 3 3) (* 12 12))

(+ 9 144)

153
```

# Conditional expressions

There are two types of conditional expressions in Scheme. `if` expressions and `cond` expressions. If expressions take a single predicate and dispatches on the result.  `cond` takes a list of predicates.

A `cond` expression takes a list of predicate-expression-pairs as arguments.

Examples:

```scheme
(if (> 5 2)
    "Five is really bigger than two."
    "Nope!")
```

And:

```scheme
(cond ((> x 0) x)
      ((= x 0) 0)
      ((< x 0) (- x)))
    
```

# Linear recursion and iteration

Programming not only involves writing mathematical functions, but also implementing computational _processes_. Although

```scheme
(define (factorial n)
    (if (= n 1)
        1
        (* n (factorial (- n 1)))))
```
and
```scheme
(define (factorial n)
    (define (iter res k)
        (if (> k n) res
            (iter (* k res)
                  (+ k 1))))
    (iter 1 1))
```

always give the same result, they define very different processes. We illustrate:

```scheme
(factorial 3)
(* 3 (factorial 2))
(* 3 (* 2 (factorial 1)))
(* 3 (* 2 1))
(* 3 2)
6
```
versus
```scheme
(factorial 3)
    (iter 1 1)
    (iter 1 2)
    (iter 2 3)
    (iter 6 4)
6
```

The first procedure is _recursive_, meaning that the process requires building up a chain of deferred operations (we cannot know the value of `(factorial 3)` before we have reached the base case. It is also _linearly recursive_ meaning that the amount of deferred operations grows linearly with `n`, just like the number of steps.

The other process is _iterative_. There is no chain of deferred operations. All we have to keep tract of is a finite number of _state variables_ (in this case: the running product, the counter, and `n`), together with a fixed rule for going from one state to the next. This process is _linear_, meaning that the number of steps needed grows linearly with `n`. 

**Note** Don't confuse an iterative _process_ and an iterative _procedure_. The latter refers to a procedure that calls itself, but the former refers to a process that follows a specific pattern.

(also a paragraph about tail recursion, but I don't really understand it yet)

# Higher order procedures

In Scheme, procedures are values, just as numbers and strings. This allow for easier abstraction building.

Say we want to sum integers:
```scheme
(define (sum-integers a b)
  (if (> a b)
      0
      (+ a (sum-integers (+ a 1) b))))
```
But now we want to sum cubes:

```scheme
(define (sum-cubes a b)
  (if (> a b)
      0
      (+ (cube a) (sum-cubes (+ a 1) b))))
```

This very much look like code duplication. We can replace the repeated word by a parameter, taking a procedure as argument:

```scheme
(define (sum term a next b)
  (if (> a b)
      0
      (+ (term a)
         (sum term (next a) next b))))
```

Now we can get the sum of cubes as follows:
```scheme
(define (cube-sum a b)
    (sum (lambda (x) (cube x))
         a
         (lambda (n) (+ n 1))
         b))
```

These are special cases of a general `accumulate` procedure, taking an _accumulator_, an initial value, and a sequence as parameters:
```scheme
(define (accumulate proc init seq)
    (if (null? seq) '()
        (cons (proc (car seq)) (cdr seq))))
```



