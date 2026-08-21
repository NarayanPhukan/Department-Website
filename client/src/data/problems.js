export const problems = [
  // ==========================================
  // UNIT 1: Introduction to 'C' Language
  // ==========================================
  {
    id: 1,
    title: "1. Sum of Two Numbers",
    difficulty: "Easy",
    description: "Write a program that takes two space-separated integers as input and prints their sum.\n\n**Note**: Write your complete program including the `main` function.",
    examples: [
      { input: "3 5", output: "8" },
      { input: "-1 5", output: "4" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    int a, b;\n    // Read input, e.g., scanf(\"%d %d\", &a, &b);\n    \n    // Write your code here to print the sum\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "3 5", expected_output: "8" },
      { name: "Test 2", input: "-1 5", expected_output: "4" },
      { name: "Test 3", input: "100 200", expected_output: "300" }
    ]
  },
  {
    id: 2,
    title: "2. Temperature Conversion",
    difficulty: "Easy",
    description: "Write a program that reads a temperature in Celsius (as a float) and prints the equivalent temperature in Fahrenheit.\nFormula: `F = (C * 9/5) + 32`\nPrint exactly 2 decimal places.",
    examples: [
      { input: "0", output: "32.00" },
      { input: "100", output: "212.00" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    float c;\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1 (0C)", input: "0", expected_output: "32.00" },
      { name: "Test 2 (100C)", input: "100", expected_output: "212.00" },
      { name: "Test 3 (37.5C)", input: "37.5", expected_output: "99.50" }
    ]
  },
  {
    id: 3,
    title: "3. Area of a Circle",
    difficulty: "Easy",
    description: "Write a program that reads the radius of a circle (as a float) and prints its area.\nAssume `PI = 3.14159`.\nPrint exactly 2 decimal places.",
    examples: [
      { input: "5", output: "78.54" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    float radius;\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "5", expected_output: "78.54" },
      { name: "Test 2", input: "10", expected_output: "314.16" },
      { name: "Test 3", input: "2.5", expected_output: "19.63" }
    ]
  },
  {
    id: 4,
    title: "4. Simple Interest",
    difficulty: "Easy",
    description: "Write a program that reads Principal (float), Rate (float), and Time in years (float) separated by spaces. Calculate and print the Simple Interest with 2 decimal places.\nFormula: `SI = (P * R * T) / 100`.",
    examples: [
      { input: "1000 5 2", output: "100.00" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "1000 5 2", expected_output: "100.00" },
      { name: "Test 2", input: "1500.5 4.5 3", expected_output: "202.57" }
    ]
  },
  {
    id: 5,
    title: "5. Swap Two Numbers",
    difficulty: "Easy",
    description: "Write a program that reads two integers `A` and `B`. Swap their values and print them separated by a space.",
    examples: [
      { input: "10 20", output: "20 10" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    int a, b;\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "10 20", expected_output: "20 10" },
      { name: "Test 2", input: "-5 15", expected_output: "15 -5" }
    ]
  },

  // ==========================================
  // UNIT 2: Conditional Statements and Loops
  // ==========================================
  {
    id: 6,
    title: "6. Even or Odd",
    difficulty: "Easy",
    description: "Write a program that takes an integer `n` as input and prints `Even` if it is even, and `Odd` if it is odd.",
    examples: [
      { input: "4", output: "Even" },
      { input: "7", output: "Odd" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    int n;\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1 (Even)", input: "4", expected_output: "Even" },
      { name: "Test 2 (Odd)", input: "7", expected_output: "Odd" },
      { name: "Test 3 (Zero)", input: "0", expected_output: "Even" }
    ]
  },
  {
    id: 7,
    title: "7. Largest of Three Numbers",
    difficulty: "Medium",
    description: "Write a program that takes three space-separated integers as input and prints the largest of the three.",
    examples: [
      { input: "1 5 3", output: "5" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "1 5 3", expected_output: "5" },
      { name: "Test 2 (Negatives)", input: "-1 -5 -2", expected_output: "-1" },
      { name: "Test 3 (All equal)", input: "10 10 10", expected_output: "10" }
    ]
  },
  {
    id: 8,
    title: "8. Leap Year Checker",
    difficulty: "Medium",
    description: "Write a program that takes an integer representing a year. Print `Yes` if it is a leap year, otherwise print `No`.\nRules: Divisible by 4, but not 100, unless it is also divisible by 400.",
    examples: [
      { input: "2024", output: "Yes" },
      { input: "1900", output: "No" },
      { input: "2000", output: "Yes" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1 (Normal Leap)", input: "2024", expected_output: "Yes" },
      { name: "Test 2 (Century Non-Leap)", input: "1900", expected_output: "No" },
      { name: "Test 3 (400 Year Leap)", input: "2000", expected_output: "Yes" },
      { name: "Test 4 (Normal Non-Leap)", input: "2023", expected_output: "No" }
    ]
  },
  {
    id: 9,
    title: "9. Sum of N Natural Numbers",
    difficulty: "Easy",
    description: "Write a program that reads an integer `N` and prints the sum of the first `N` natural numbers using a loop.",
    examples: [
      { input: "5", output: "15" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1 (N=5)", input: "5", expected_output: "15" },
      { name: "Test 2 (N=10)", input: "10", expected_output: "55" },
      { name: "Test 3 (N=1)", input: "1", expected_output: "1" }
    ]
  },
  {
    id: 10,
    title: "10. Factorial of a Number",
    difficulty: "Medium",
    description: "Write a program that reads an integer `N` and prints its factorial using a loop. Assume `N` is small enough that the result fits in a standard integer.",
    examples: [
      { input: "5", output: "120" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1 (N=5)", input: "5", expected_output: "120" },
      { name: "Test 2 (N=0)", input: "0", expected_output: "1" },
      { name: "Test 3 (N=6)", input: "6", expected_output: "720" }
    ]
  },

  // ==========================================
  // UNIT 3: Arrays & Functions
  // ==========================================
  {
    id: 11,
    title: "11. Sum of Array Elements",
    difficulty: "Easy",
    description: "Write a program that first takes an integer `N` (the size of the array), followed by `N` integers. Print the sum of all elements.",
    examples: [
      { input: "4\\n1 2 3 4", output: "10" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    int n;\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "4\n1 2 3 4", expected_output: "10" },
      { name: "Test 2", input: "5\n-1 -2 -3 -4 -5", expected_output: "-15" }
    ]
  },
  {
    id: 12,
    title: "12. Find Maximum in Array",
    difficulty: "Easy",
    description: "Write a program that reads an integer `N`, followed by `N` integers. Print the maximum element in the array.",
    examples: [
      { input: "5\\n10 50 20 40 30", output: "50" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "5\n10 50 20 40 30", expected_output: "50" },
      { name: "Test 2 (Negatives)", input: "3\n-10 -5 -20", expected_output: "-5" }
    ]
  },
  {
    id: 13,
    title: "13. Reverse an Array",
    difficulty: "Medium",
    description: "Write a program that takes an integer `N`, followed by `N` integers. Print the integers in reverse order, separated by a space.",
    examples: [
      { input: "3\\n1 2 3", output: "3 2 1" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "3\n1 2 3", expected_output: "3 2 1" },
      { name: "Test 2", input: "5\n10 20 30 40 50", expected_output: "50 40 30 20 10" }
    ]
  },
  {
    id: 14,
    title: "14. Check Prime Number (Function)",
    difficulty: "Medium",
    description: "Write a function `isPrime(int n)` that returns 1 if prime, 0 otherwise. Use this function in `main` to read an integer and print `Prime` or `Not Prime`.",
    examples: [
      { input: "7", output: "Prime" },
      { input: "10", output: "Not Prime" }
    ],
    starter_code: "#include <stdio.h>\n\nint isPrime(int n) {\n    // Write function logic\n}\n\nint main() {\n    // Call function and print\n    return 0;\n}",
    test_cases: [
      { name: "Test 1 (Prime)", input: "7", expected_output: "Prime" },
      { name: "Test 2 (Not Prime)", input: "10", expected_output: "Not Prime" },
      { name: "Test 3 (1 is Not Prime)", input: "1", expected_output: "Not Prime" }
    ]
  },
  {
    id: 15,
    title: "15. Nth Fibonacci (Recursion)",
    difficulty: "Hard",
    description: "Write a recursive function `fib(int n)` that returns the `n`-th Fibonacci number. Assume `fib(0) = 0` and `fib(1) = 1`. In `main`, read `n` and print `fib(n)`.",
    examples: [
      { input: "6", output: "8" }
    ],
    starter_code: "#include <stdio.h>\n\nint fib(int n) {\n    // Recursive logic here\n}\n\nint main() {\n    // Read input and print\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "6", expected_output: "8" },
      { name: "Test 2", input: "0", expected_output: "0" },
      { name: "Test 3", input: "10", expected_output: "55" }
    ]
  },

  // ==========================================
  // UNIT 4: Structures
  // ==========================================
  {
    id: 16,
    title: "16. 2D Point Distance",
    difficulty: "Medium",
    description: "Define a struct `Point` with integers `x` and `y`. Read two points (x1 y1 x2 y2). Calculate and print the squared distance between them: `(x2-x1)^2 + (y2-y1)^2`.",
    examples: [
      { input: "0 0 3 4", output: "25" }
    ],
    starter_code: "#include <stdio.h>\n\nstruct Point {\n    int x;\n    int y;\n};\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "0 0 3 4", expected_output: "25" },
      { name: "Test 2", input: "-1 -1 1 1", expected_output: "8" }
    ]
  },
  {
    id: 17,
    title: "17. Add Complex Numbers",
    difficulty: "Medium",
    description: "Define a struct `Complex` with integers `real` and `img`. Read two complex numbers (real1 img1 real2 img2). Print their sum in the format `real + img i`.",
    examples: [
      { input: "3 2 4 5", output: "7 + 7i" }
    ],
    starter_code: "#include <stdio.h>\n\nstruct Complex {\n    int real;\n    int img;\n};\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "3 2 4 5", expected_output: "7 + 7i" },
      { name: "Test 2", input: "-1 5 1 -2", expected_output: "0 + 3i" }
    ]
  },
  {
    id: 18,
    title: "18. Student Total Marks",
    difficulty: "Easy",
    description: "Define a struct `Student` with an integer `roll` and three integer marks `m1, m2, m3`. Read roll and 3 marks. Print the roll number and total marks separated by a space.",
    examples: [
      { input: "101 80 90 85", output: "101 255" }
    ],
    starter_code: "#include <stdio.h>\n\nstruct Student {\n    int roll;\n    int m1, m2, m3;\n};\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "101 80 90 85", expected_output: "101 255" },
      { name: "Test 2", input: "5 10 10 10", expected_output: "5 30" }
    ]
  },
  {
    id: 19,
    title: "19. Rectangle Area",
    difficulty: "Easy",
    description: "Define a struct `Rectangle` with integers `length` and `width`. Read length and width, and print the area.",
    examples: [
      { input: "5 10", output: "50" }
    ],
    starter_code: "#include <stdio.h>\n\nstruct Rectangle {\n    int length;\n    int width;\n};\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "5 10", expected_output: "50" },
      { name: "Test 2", input: "7 3", expected_output: "21" }
    ]
  },
  {
    id: 20,
    title: "20. Array of Structures",
    difficulty: "Hard",
    description: "Define a struct `Item` with `id` and `price`. Read an integer `N`, followed by `N` items (each having id and price). Find and print the `id` of the item with the highest price.",
    examples: [
      { input: "3\\n1 100\\n2 500\\n3 200", output: "2" }
    ],
    starter_code: "#include <stdio.h>\n\nstruct Item {\n    int id;\n    int price;\n};\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "3\n1 100\n2 500\n3 200", expected_output: "2" },
      { name: "Test 2", input: "2\n10 50\n20 50", expected_output: "10" } // If tie, first one
    ]
  },

  // ==========================================
  // UNIT 5: Pointers & File Processing
  // ==========================================
  {
    id: 21,
    title: "21. Swap by Reference",
    difficulty: "Medium",
    description: "Write a function `void swap(int *a, int *b)` that swaps the values of two variables. In `main`, read two integers, call `swap`, and print them separated by a space.",
    examples: [
      { input: "10 20", output: "20 10" }
    ],
    starter_code: "#include <stdio.h>\n\nvoid swap(int *a, int *b) {\n    // Write logic here\n}\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "10 20", expected_output: "20 10" },
      { name: "Test 2", input: "-5 15", expected_output: "15 -5" }
    ]
  },
  {
    id: 22,
    title: "22. Array Sum using Pointers",
    difficulty: "Hard",
    description: "Read an integer `N`, followed by `N` integers into an array. Use a pointer to iterate through the array (e.g. `*ptr`, `ptr++`) and calculate the sum. Print the sum.",
    examples: [
      { input: "3\\n1 2 3", output: "6" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here using pointers\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "3\n1 2 3", expected_output: "6" },
      { name: "Test 2", input: "5\n10 10 10 10 10", expected_output: "50" }
    ]
  },
  {
    id: 23,
    title: "23. Max Element using Pointers",
    difficulty: "Medium",
    description: "Read `N` followed by `N` integers. Find the maximum element in the array using pointer arithmetic and print it.",
    examples: [
      { input: "4\\n10 50 20 30", output: "50" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here using pointers\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "4\n10 50 20 30", expected_output: "50" },
      { name: "Test 2", input: "2\n-1 -5", expected_output: "-1" }
    ]
  },
  {
    id: 24,
    title: "24. Copy Array using Pointers",
    difficulty: "Hard",
    description: "Read `N` followed by `N` integers into an array `A`. Declare a second array `B`. Use pointers to copy all elements from `A` to `B`. Print the elements of `B` separated by space.",
    examples: [
      { input: "3\\n1 2 3", output: "1 2 3" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "3\n1 2 3", expected_output: "1 2 3" },
      { name: "Test 2", input: "1\n42", expected_output: "42" }
    ]
  },
  {
    id: 25,
    title: "25. Reverse Array using Pointers",
    difficulty: "Hard",
    description: "Read `N` and `N` integers into an array. Use two pointers (one at start, one at end) to swap elements and reverse the array in-place. Print the reversed array.",
    examples: [
      { input: "4\\n1 2 3 4", output: "4 3 2 1" }
    ],
    starter_code: "#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}",
    test_cases: [
      { name: "Test 1", input: "4\n1 2 3 4", expected_output: "4 3 2 1" },
      { name: "Test 2", input: "5\n10 20 30 40 50", expected_output: "50 40 30 20 10" }
    ]
  }
];
