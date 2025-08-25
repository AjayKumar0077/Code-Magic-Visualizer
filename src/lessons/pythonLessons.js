export const pythonLessons = [
  {
    id: 'greet',
    title: 'Write greet()',
    description: 'Create a function greet() that returns the string "Hello, World!"',
    starterCode: `# Define function greet() that returns "Hello, World!"
# Example:
# def greet():
#     return "Hello, World!"
`,
    testCode: `# === TESTS ===
try:
    assert callable(greet)
    assert greet() == 'Hello, World!'
    print('CHECK: PASS')
except Exception as e:
    print('CHECK: FAIL:', e)
`,
  },
  {
    id: 'add',
    title: 'Write add(a, b)',
    description: 'Create a function add(a, b) that returns the sum of two numbers.',
    starterCode: `# Define function add(a, b) that returns a + b
`,
    testCode: `# === TESTS ===
try:
    assert callable(add)
    assert add(2, 3) == 5
    assert add(-1, 1) == 0
    print('CHECK: PASS')
except Exception as e:
    print('CHECK: FAIL:', e)
`,
  },
  {
    id: 'factorial',
    title: 'Write factorial(n)',
    description: 'Create factorial(n) that returns n! For n=5, result should be 120.',
    starterCode: `# Define factorial(n) using loop or recursion
`,
    testCode: `# === TESTS ===
try:
    assert callable(factorial)
    assert factorial(0) == 1
    assert factorial(5) == 120
    print('CHECK: PASS')
except Exception as e:
    print('CHECK: FAIL:', e)
`,
  },
  {
    id: 'is_even',
    title: 'Write is_even(n)',
    description: 'Create is_even(n) that returns True when n is even, else False.',
    starterCode: `# Define is_even(n)
`,
    testCode: `# === TESTS ===
try:
    assert callable(is_even)
    assert is_even(2) is True
    assert is_even(3) is False
    print('CHECK: PASS')
except Exception as e:
    print('CHECK: FAIL:', e)
`,
  },
];
