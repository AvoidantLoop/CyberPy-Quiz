QUESTIONS = [
    {
        "id": 1,
        "question": "Given the definitions: class A: pass; class B(A): pass; class C(A): pass; class D(B, C): pass. What is the correct Method Resolution Order (MRO) of class D under C3 Linearization?",
        "options": [
            "['D', 'B', 'C', 'A', 'object']",
            "['D', 'B', 'A', 'C', 'object']",
            "['D', 'C', 'B', 'A', 'object']",
            "['D', 'B', 'C', 'object']"
        ],
        "correct_option": 0
    },
    {
        "id": 2,
        "question": "What is the evaluated output of the following closure operation? funcs = [lambda x: x * i for i in range(3)]; print([f(2) for f in funcs])",
        "options": [
            "[0, 2, 4]",
            "[4, 4, 4]",
            "[0, 0, 0]",
            "[2, 2, 2]"
        ],
        "correct_option": 1
    },
    {
        "id": 3,
        "question": "What is the printed output of this mutable default argument snippet? def append_to(num, target=[]): target.append(num); return target; append_to(1); print(append_to(2))",
        "options": [
            "[2]",
            "[1, 2]",
            "Error: list index out of range",
            "None"
        ],
        "correct_option": 1
    },
    {
        "id": 4,
        "question": "Which standard metaclass dunder method is directly responsible for allocating memory and returning the newly created class object (before initialization)?",
        "options": [
            "__init__",
            "__new__",
            "__call__",
            "__prepare__"
        ],
        "correct_option": 1
    },
    {
        "id": 5,
        "question": "In a standard interactive CPython shell, what is the output of the comparison: a = 256; b = 256; c = 257; d = 257; print(a is b, c is d)?",
        "options": [
            "True True",
            "True False",
            "False False",
            "False True"
        ],
        "correct_option": 1
    },
    {
        "id": 6,
        "question": "For a custom non-data descriptor (defining only __get__) and an instance attribute with the same name, which one takes lookup precedence in CPython?",
        "options": [
            "The non-data descriptor always takes precedence",
            "The instance dictionary attribute takes precedence",
            "It results in an immediate AttributeError",
            "It is resolved non-deterministically based on dictionary order"
        ],
        "correct_option": 1
    },
    {
        "id": 7,
        "question": "What is the primary operational mechanism of the 'yield from iterable' statement in delegating generators?",
        "options": [
            "It is a simple syntactic sugar equivalent to: for item in iterable: yield item",
            "It establishes a direct bidirectional communications channel between the outer caller and the subgenerator, automatically forwarding values and exceptions",
            "It compiles the generator to compiled C bytecode for a 10x speedup",
            "It processes the iterable concurrently in a background OS-level thread"
        ],
        "correct_option": 1
    },
    {
        "id": 8,
        "question": "In CPython, why does executing 10 CPU-bound threads under a multi-core processor fail to utilize multiple CPU cores?",
        "options": [
            "Because CPython utilizes greenlet user-space threads instead of native OS threads",
            "Due to the Global Interpreter Lock (GIL) restricting execution to a single native thread at a time",
            "Because the operating system scheduler limits Python to a single CPU affinity mask",
            "Due to CPU cache invalidation bottlenecks caused by concurrent GIL polling"
        ],
        "correct_option": 1
    },
    {
        "id": 9,
        "question": "Given the definition: @decorator_one; @decorator_two; def my_func(): pass. In what order are the decorators evaluated at function definition time?",
        "options": [
            "decorator_one is executed first, then decorator_two",
            "decorator_two is executed first, then decorator_one",
            "They are executed concurrently using asynchronous callbacks",
            "It is non-deterministic and depends on compiler optimization"
        ],
        "correct_option": 1
    },
    {
        "id": 10,
        "question": "Which special dunder method should be overridden in a dict subclass to custom-define behavior specifically when key lookup via dict[key] fails?",
        "options": [
            "__getitem__",
            "__missing__",
            "__error__",
            "__keyerror__"
        ],
        "correct_option": 1
    }
]
