# AP Computer Science A — master IDs 13-xxx plus research expansion. Pending teacher review.
@subject ap-computer-science-a | AP Computer Science A | AP 计算机科学 A | CSA | slate | 14
@desc Object-oriented programming in Java: data, control flow, classes and data collections.
@framework Unit titles follow the revised AP Computer Science A course framework (4 units).

@unit 1 | Using Objects and Methods | 使用对象与方法
- variable | 变量 | A named storage location for a value | 用名字表示、可以存储值的内存位置，必须先声明类型。 | int score = 0; declares a variable named score. | 1 | #13-001
- data type | 数据类型 | A classification that determines possible values and operations | 决定变量可以存储什么值、能做哪些运算的分类。 | The data type double stores decimal numbers. | 1 | #13-002
- primitive type | 基本数据类型 | A built-in type that stores a simple value directly, such as int, double or boolean | Java 内置的简单类型，变量中直接存储值。 | int and boolean are primitive types. | 2 | #13-003
  vs: reference type
- reference type | 引用类型 | A type whose variables store a reference to an object | 变量存储的是对象的地址（引用），如 String、ArrayList。 | Two String variables can refer to the same object. | 2 | #13-004
  vs: primitive type
- assignment | 赋值 | Storing a value in a variable using = | 用 = 把值存入变量；注意 = 是赋值，== 是比较。 | x = x + 1; is an assignment that increases x. | 1 | #13-005
- method | 方法 | A named block of code that performs a task and can be called | 有名字、可被调用以完成特定任务的代码块。 | Math.sqrt(16) calls a method that returns 4.0. | 1 | #13-011
- parameter | 形参 | A variable in a method declaration that receives a value | 方法声明中用于接收传入值的变量。 | In void greet(String name), name is a parameter. | 2 | #13-012
  vs: argument
- argument | 实参 | The actual value passed when a method is called | 调用方法时实际传入的值。 | In greet("Lin"), "Lin" is the argument. | 2 | #13-013
  vs: parameter
- return value | 返回值 | The value a method sends back to its caller | 方法执行完后返回给调用者的值；void 方法没有返回值。 | The method returns a boolean value of true. | 1 | #13-014
- String | 字符串 | An object representing a sequence of characters | 表示字符序列的对象，不可变（immutable）。 | "AP".length() returns 2. | 1
- null | 空引用 | A special value meaning a reference variable does not refer to any object | 引用变量不指向任何对象，调用其方法会导致 NullPointerException。 | Calling a method on a null reference throws a NullPointerException. | 2
- integer division | 整数除法 | Division of two ints that discards the remainder | 两个 int 相除时舍去小数部分。 | 7 / 2 evaluates to 3 in Java. | 1
  mis: 7 / 2 equals 3.5 in Java — with two ints, the result is truncated to 3.

@unit 2 | Selection and Iteration | 选择与循环
- Boolean expression | 布尔表达式 | An expression that evaluates to true or false | 结果为 true 或 false 的表达式。 | x > 0 && x < 10 is a Boolean expression. | 1
- conditional statement | 条件语句 | A statement that executes code only if a Boolean condition is true | 根据布尔条件决定是否执行的语句（if / else）。 | An if-else statement chooses between two branches. | 1 | #13-006
- short-circuit evaluation | 短路求值 | Stopping evaluation of && or || as soon as the result is known | && 左边为 false 或 || 左边为 true 时，不再计算右边。 | Short-circuit evaluation prevents (x != 0 && 10 / x > 2) from dividing by zero. | 3
- De Morgan's laws | 德摩根定律 | !(a && b) is equivalent to !a || !b, and !(a || b) is equivalent to !a && !b | 否定“与”变成“或”，否定“或”变成“与”，同时每个条件取反。 | By De Morgan's laws, !(x > 0 && y > 0) equals x <= 0 || y <= 0. | 3
- iteration | 迭代 | Repeating a set of statements | 重复执行一组语句（循环）。 | A for loop provides iteration over an index. | 1 | #13-007
- loop invariant | 循环不变式 | A condition that is true before and after each iteration of a loop | 每次循环前后都保持为真的条件，用于证明算法正确性。 | The loop invariant states that sum holds the total of elements 0 to i − 1. | 3 | #13-008
- off-by-one error | 差一错误 | A bug in which a loop runs one time too many or too few | 循环多执行或少执行一次的错误，常见于边界条件。 | Using i <= arr.length causes an off-by-one error. | 2
- infinite loop | 死循环 | A loop whose condition never becomes false | 条件永远不为 false 的循环。 | Forgetting to update the loop variable causes an infinite loop. | 1

@unit 3 | Class Creation | 类的创建
- class | 类 | A blueprint that defines the attributes and behaviors of objects | 定义对象属性和行为的蓝图。 | The Student class defines a name field and a getGPA method. | 1
  vs: object
- object | 对象 | An instance of a class | 根据类创建的具体实例。 | new Student("Lin") creates a Student object. | 1
  vs: class
- constructor | 构造方法 | A special method that initializes a new object | 创建对象时调用、用于初始化实例变量的特殊方法，与类同名且无返回类型。 | The constructor sets the student's name when the object is created. | 2 | #13-015
- instance variable | 实例变量 | A variable that belongs to each object of a class | 每个对象各自拥有的变量（属性），通常设为 private。 | Each Student object has its own name instance variable. | 2
  vs: static variable
- static variable | 静态变量 | A variable shared by all objects of a class | 属于类本身、所有对象共享的变量。 | A static count variable tracks how many objects were created. | 3
  vs: instance variable
- encapsulation | 封装 | Bundling data and methods and restricting direct access to data | 把数据和方法封装在一起，并用 private 限制外部直接访问。 | Making fields private and using getters is encapsulation. | 2 | #13-016
- accessor method | 访问器方法 | A method that returns the value of an instance variable | 返回实例变量值的方法（getter）。 | getName() is an accessor method. | 2
  vs: mutator method
- mutator method | 修改器方法 | A method that changes the value of an instance variable | 修改实例变量值的方法（setter）。 | setName(String n) is a mutator method. | 2
  vs: accessor method
- this keyword | this 关键字 | A reference to the current object | 指向当前对象的引用，常用于区分同名的形参和实例变量。 | this.name = name; assigns the parameter to the instance variable. | 2
- inheritance | 继承 | A mechanism by which a class derives attributes and methods from another class | 子类继承父类的属性和方法（extends）。 | class Dog extends Animal uses inheritance. | 2 | #13-017
- polymorphism | 多态 | The ability of a reference to call the overridden method of the actual object's type | 同一引用在运行时根据实际对象类型调用相应的方法。 | An Animal reference to a Dog calls Dog's speak() method — polymorphism. | 3 | #13-018

@unit 4 | Data Collections | 数据集合
- array | 数组 | A fixed-size, indexed collection of elements of the same type | 长度固定、元素类型相同、按下标访问的集合，下标从 0 开始。 | int[] nums = new int[5]; creates an array of length 5. | 1 | #13-009
  vs: ArrayList
- ArrayList | 动态数组列表 | A resizable list of objects in Java | 可以改变大小的列表，只能存对象（基本类型需包装）。 | list.add(7) adds an element to the end of an ArrayList. | 2 | #13-010
  vs: array
- ArrayIndexOutOfBoundsException | 数组下标越界异常 | An error from accessing an index less than 0 or at least the array length | 访问小于 0 或大于等于长度的下标时抛出的异常。 | arr[arr.length] throws ArrayIndexOutOfBoundsException. | 2
- 2D array | 二维数组 | An array of arrays organized in rows and columns | 由数组组成的数组，按行和列访问。 | grid[2][3] accesses row 2, column 3. | 2
- traversal | 遍历 | Visiting each element of a data structure in order | 按顺序访问数据结构中的每个元素。 | An enhanced for loop performs a traversal of the array. | 1
- linear search | 线性查找 | Checking elements one by one until the target is found | 逐个检查元素直到找到目标，适用于无序数据。 | Linear search may check every element in the worst case. | 2
  vs: binary search
- binary search | 二分查找 | Repeatedly halving a sorted list to find a target | 在有序列表中反复折半查找，效率高。 | Binary search requires the array to be sorted. | 2
  vs: linear search
- selection sort | 选择排序 | A sort that repeatedly selects the smallest remaining element and swaps it into place | 每次选出剩余最小元素放到正确位置的排序算法。 | Selection sort makes n − 1 passes through the array. | 3
  vs: insertion sort
- insertion sort | 插入排序 | A sort that builds a sorted section by inserting each element into its correct position | 把每个元素插入到已排序部分的正确位置的排序算法。 | Insertion sort is efficient for nearly sorted data. | 3
  vs: selection sort
- recursion | 递归 | A method that calls itself on a smaller version of the problem | 方法调用自身来解决规模更小的同类问题，必须有终止条件（基本情况）。 | A recursive factorial method calls factorial(n − 1). | 3 | #13-019
- base case | 基本情况 | The condition in a recursive method that stops the recursion | 递归中不再调用自身、直接返回的情况，缺少会导致无限递归。 | if (n == 0) return 1; is the base case. | 2
- algorithmic complexity | 算法复杂度 | How the time or memory an algorithm uses grows with input size | 算法所需时间或内存随输入规模增长的方式。 | Binary search has lower algorithmic complexity than linear search. | 3 | #13-020

@q csa-u1-001 | APPLY | APPLICATION | MCQ | 1 | 1 | integer division
? What is the value of 17 / 5 in Java when both are int values?
=* 3 :: Correct — integer division truncates.
= 3.4 :: That would require a double.
= 4 :: Java truncates, it does not round.
= 2 :: That is 17 % 5.
! When both operands are int, Java performs integer division and discards the decimal part.
!zh 两个 int 相除时，Java 执行整数除法，直接舍去小数部分。
@q csa-u1-002 | UNDERSTAND | CONCEPT | SCENARIO | 1 | 2 | parameter; argument
? In the call calculateArea(4, 7), what are 4 and 7?
= Parameters :: Parameters are in the method declaration.
=* Arguments :: Correct — they are the actual values passed.
= Return values :: Return values come back from the method.
= Instance variables :: Instance variables belong to objects.
! Parameters appear in the method header; arguments are the values supplied in a call.
!zh 形参出现在方法声明中；实参是调用时传入的实际值。

@pair param-vs-arg | parameter | argument
! A parameter is the variable named in the method's declaration; an argument is the actual value supplied when the method is called.
!zh 形参是方法声明中的变量；实参是调用方法时传入的实际值。
s: A :: public int square(int n) — n here. :: Declared in the header.
s: B :: square(9) — 9 here. :: Supplied at call time.
s: B :: The value "Alice" in printName("Alice"). :: Actual value.
s: A :: The double r in double area(double r). :: Declared variable.
@pair array-vs-arraylist | array | ArrayList
! An array has a fixed length and can hold primitives; an ArrayList can grow and shrink but holds only objects.
!zh 数组长度固定、可存基本类型；ArrayList 可变长，只能存对象。
d: Size :: Fixed after creation (.length) :: Changes with add/remove (.size())
d: Element access :: arr[i] :: list.get(i)
s: A :: int[] scores = new int[30]; :: Fixed-size, primitives.
s: B :: names.add("Kai"); :: Dynamic growth.
s: B :: Uses size() to find how many elements. :: ArrayList method.
s: A :: Uses .length with no parentheses. :: Array field.
