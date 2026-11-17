# AP Precalculus — EN/中文 pairs from the uploaded Precal_Chapter_1-3 sheet (160 terms; Chinese preserved as supplied,
# with definitions added by AP Lexicon), plus geometry/algebra language requested in the BC notes, plus AP Precalculus
# units 2–3 expansion. Pending teacher review.
@subject ap-precalculus | AP Precalculus | AP 预备微积分 | Precalc | violet | 9
@desc Functions as models: polynomial, rational, exponential, logarithmic and trigonometric — plus the math language of logic and sets.
@framework Units 1–3 follow the AP Precalculus course framework. Unit 0 (logic, sets, math language) reflects the uploaded class chapters, not the AP framework.

@unit 0 | Math Language, Logic and Sets | 数学语言、逻辑与集合
@topic 0.1 | Sets and Numbers | 集合与数 | Use roster and set-builder notation; Classify numbers
- set | 集合 | A well-defined collection of distinct objects called elements | 由确定的、互不相同的对象（元素）组成的整体。 | The set of even digits is {0, 2, 4, 6, 8}. | 1
- element | 元素 | An object that belongs to a set | 集合中的每一个对象，记作 a ∈ A。 | 3 is an element of the set of odd numbers. | 1
- empty set | 空集 | The set with no elements, written ∅ or { } | 不含任何元素的集合，是任何集合的子集。 | The solution set of x² = −1 over the real numbers is the empty set. | 1
- finite set | 有限集 | A set with a countable, limited number of elements | 元素个数有限的集合。 | The set of months in a year is a finite set. | 1
  vs: infinite set
- infinite set | 无限集 | A set with unlimited elements | 元素个数无限的集合。 | The set of integers is an infinite set. | 1
  vs: finite set
- subset | 子集 | A set whose every element is also in another set | A 中每个元素都属于 B，则 A 是 B 的子集，记作 A ⊆ B。 | {1, 2} is a subset of {1, 2, 3}. | 1
  vs: proper subset
- proper subset | 真子集 | A subset that is not equal to the whole set | A ⊆ B 且 A ≠ B，记作 A ⊊ B。 | {1, 2} is a proper subset of {1, 2, 3}, but {1, 2, 3} is not a proper subset of itself. | 2
  vs: subset
- universal set | 全集 | The set containing all objects under consideration | 所研究问题中所有对象组成的集合，常记作 U。 | If U is the set of real numbers, the complement of the rationals is the irrationals. | 1
- complement | 补集 | The elements of the universal set that are not in a given set | 全集中不属于集合 A 的元素组成的集合，记作 Aᶜ 或 ∁ᵤA。 | If U = {1,…,5} and A = {1, 2}, the complement of A is {3, 4, 5}. | 1
- union | 并集 | The set of elements in A or B (or both) | 属于 A 或属于 B 的所有元素组成的集合，记作 A ∪ B。 | {1, 2} ∪ {2, 3} = {1, 2, 3}. | 1
  vs: intersection
- intersection | 交集 | The set of elements in both A and B | 同时属于 A 和 B 的元素组成的集合，记作 A ∩ B。 | {1, 2} ∩ {2, 3} = {2}. | 1
  vs: union
- roster method | 列举法 | Describing a set by listing its elements in braces | 把集合的元素一一列举在花括号中。 | Using the roster method, the first three primes are {2, 3, 5}. | 1
  vs: set-builder notation
- set-builder notation | 描述法（特征性质描述法） | Describing a set by a property its elements satisfy | 用元素满足的共同特征描述集合，如 {x ∣ x > 2}。 | {x ∣ x is a real number and x > 2} is written in set-builder notation. | 2
  vs: roster method
- braces | 花括号 { } | The symbols { } used to enclose the elements of a set | 用来表示集合的符号。 | Braces show that {a, b} is a set. | 1
- Venn Diagram | 韦恩图 | A diagram using overlapping circles to show relationships among sets | 用重叠的圆表示集合之间关系的图。 | A Venn diagram shows students who take both biology and chemistry in the overlap. | 1
- natural numbers | 自然数（含0） | The counting numbers; conventions differ on whether 0 is included | 计数用的数。注意：中国教材自然数含 0，美国教材常从 1 开始，阅读题目时要看定义。 | Some US textbooks define the natural numbers as {1, 2, 3, …}. | 1
  mis: Natural numbers always include 0 — many US textbooks start at 1; check the course's definition.
- integers | 整数 | The whole numbers and their negatives: …, −2, −1, 0, 1, 2, … | 正整数、零和负整数的统称。 | −7 is an integer but not a natural number. | 1
- rational numbers | 有理数 | Numbers that can be written as a ratio of two integers with a nonzero denominator | 可以写成两个整数之比（分母不为零）的数，包括有限小数和无限循环小数。 | 0.75 = 3/4 is a rational number. | 1
- real numbers | 实数 | All rational and irrational numbers; every point on the number line | 有理数和无理数的统称，与数轴上的点一一对应。 | √2 is a real number but not a rational number. | 1
- negative number | 负数 | A real number less than zero | 小于零的实数。 | −3 is a negative number. | 1
- interval | 区间 | A set of real numbers between two endpoints | 两个端点之间所有实数组成的集合。 | The interval [2, 5) contains 2 but not 5. | 1
- open interval | 开区间 | An interval that does not include its endpoints, written (a, b) | 不包含端点的区间。 | The open interval (0, 1) does not include 0 or 1. | 1
  vs: closed interval
- closed interval | 闭区间 | An interval that includes its endpoints, written [a, b] | 包含端点的区间。极值定理要求函数在闭区间上连续。 | The Extreme Value Theorem applies on a closed interval [a, b]. | 1
  vs: open interval
- endpoint | 端点 | A boundary value of an interval | 区间的边界点。 | The endpoints of [−2, 3] are −2 and 3. | 1
- solution set | 解集 | The set of all values that satisfy an equation or inequality | 满足方程或不等式的所有值组成的集合。 | The solution set of x² < 4 is (−2, 2). | 1
- infinity | 无穷大（∞） | A concept describing a quantity without bound; not a real number | 表示无界增长的概念，不是一个实数，所以区间端点为 ∞ 时总用开括号。 | The interval [3, ∞) uses a parenthesis at infinity. | 1
@topic 0.2 | Logic and Reasoning | 逻辑与推理 | Determine truth values; Distinguish necessary and sufficient conditions
- proposition | 命题 | A declarative sentence that is either true or false, but not both | 可以判断真假的陈述句。 | "7 is prime" is a proposition; "Is 7 prime?" is not. | 1
  rel: truth-value
- declarative sentence | 陈述句 | A sentence that makes a statement | 陈述事实或观点的句子，命题必须是陈述句。 | Questions and commands are not declarative sentences, so they are not propositions. | 1
- truth-value | 真值（能否判断真假） | Whether a proposition is true or false | 命题的真或假。 | The truth-value of "2 + 2 = 5" is false. | 1
- simple proposition | 简单命题 | A proposition that contains no logical connectives | 不含逻辑联结词的命题。 | "x is even" is a simple proposition. | 1
  vs: compound proposition
- compound proposition | 复合命题 | A proposition formed by combining simple propositions with connectives | 由简单命题通过“且、或、非”等联结词组成的命题。 | "x > 0 and x < 5" is a compound proposition. | 2
  vs: simple proposition
- logical connectives | 逻辑联结词（or / and / not） | Words such as and, or and not that combine or modify propositions | 用来连接或否定命题的词：且（and）、或（or）、非（not）。 | "or" in mathematics is inclusive: p or q is true if either or both are true. | 2
- truth table | 真值表 | A table listing the truth-value of a compound proposition for every combination of inputs | 列出各简单命题所有真假组合下复合命题真值的表格。 | A truth table for "p and q" has four rows. | 2
- quantifier | 量词 | A word such as "for all" or "there exists" that states how many values satisfy a statement | 表示数量范围的词，如“所有”“存在”。 | Changing the quantifier from "all" to "some" can change a statement's truth. | 2
- universal quantifier | 全称量词（∀） | "For all" or "for every," written ∀ | 表示“对所有”的量词。 | "∀x ∈ ℝ, x² ≥ 0" uses the universal quantifier. | 2
  vs: existential quantifier
- existential quantifier | 存在量词（∃） | "There exists" or "for some," written ∃ | 表示“存在（至少一个）”的量词。 | "∃x such that x² = 4" uses the existential quantifier. | 2
  vs: universal quantifier
- necessary condition | 必要条件 | A condition that must hold for a statement to be true, though it may not be enough | 若 p ⇒ q，则 q 是 p 的必要条件（没有 q 就一定没有 p）。 | Being continuous is a necessary condition for being differentiable. | 3
  mis: Necessary means "enough" — a necessary condition must be true but may not guarantee the result.
  vs: sufficient condition
- sufficient condition | 充分条件 | A condition that guarantees a statement is true | 若 p ⇒ q，则 p 是 q 的充分条件（有 p 就一定有 q）。 | Being differentiable is a sufficient condition for being continuous. | 3
  vs: necessary condition
- inference | 推论 | A conclusion reached by reasoning from given statements | 由已知条件推理得到的结论。 | From "all squares are rectangles" and "ABCD is a square," we infer ABCD is a rectangle. | 2
- transitive property | 传递性 | If a relates to b and b relates to c, then a relates to c (e.g., if a < b and b < c, then a < c) | 若 a 与 b 有某关系，b 与 c 有同样关系，则 a 与 c 也有该关系。 | Because 2 < 5 and 5 < 9, the transitive property gives 2 < 9. | 1
- arbitrary | 任意的 | Chosen without restriction, so a result holds for every possible choice | 不加限制地任取，用来说明结论对所有情况都成立。 | Let x be an arbitrary real number; then x² ≥ 0. | 2
- distinct | 互不相同的，不同的 | Different from each other | 彼此不同。 | The equation has two distinct real roots, so the roots are not equal. | 1
- denote | 表示，记作 | To represent by a symbol | 用某个符号表示。 | Let f(x) denote the height in meters at time x. | 1
- correspondence | 对应 | A pairing between elements of two sets | 两个集合元素之间的配对关系，函数是一种特殊的对应。 | A function is a correspondence that assigns each input exactly one output. | 2
- relation | 关系，对应关系 | Any set of ordered pairs | 任意一组有序数对，函数是每个输入只对应一个输出的关系。 | {(1, 2), (1, 3)} is a relation but not a function. | 1
- equality | 等式 | A statement that two expressions are equal | 表示两个表达式相等的式子。 | The equality 2(x + 3) = 2x + 6 holds for every x. | 1
- inequality | 不等式 | A statement comparing two expressions using <, >, ≤ or ≥ | 用不等号连接的式子。 | Multiplying an inequality by a negative number reverses its direction. | 1
- addition / subtraction property | 加（减）法性质 | Adding or subtracting the same quantity on both sides preserves an equation or inequality | 等式或不等式两边同加（减）同一个数，关系不变。 | Subtracting 4 from both sides of x + 4 = 9 gives x = 5. | 1
- multiplication / division property | 乘（除）法性质 | Multiplying or dividing both sides by the same nonzero number preserves an equation; for inequalities, a negative reverses the sign | 等式两边同乘（除）非零数仍成立；不等式乘除负数要变号。 | Dividing −2x > 6 by −2 gives x < −3. | 2
- reversal property | 反向（可逆）性质 | The property that an inequality's direction reverses when both sides are multiplied by a negative or when sides are swapped | 不等式两边乘以负数或交换两边时，不等号方向改变。 | By the reversal property, if a < b then −a > −b. | 2
- reverse | 反向 | To change to the opposite direction or order | 改为相反的方向或顺序。 | Remember to reverse the inequality sign when dividing by a negative. | 1
- correct to two decimal places | 精确到两位小数 | Rounded so that two digits appear after the decimal point | 四舍五入保留两位小数。AP 计算器题常要求精确到三位小数。 | π correct to two decimal places is 3.14. | 1
- sum / difference / product / quotient | 和 / 差 / 积 / 商 | The results of addition, subtraction, multiplication and division | 加、减、乘、除的结果。 | The quotient of 12 and 4 is 3. | 1
- evaluate | 求值，计算 | To find the numerical value of an expression | 计算表达式的值。 | Evaluate f(2) for f(x) = x² + 1 to get 5. | 1
- standard form | 标准形式 | A conventional way of writing an expression or equation | 约定俗成的书写方式，如二次函数的一般式 ax² + bx + c。 | y = 2x² − 3x + 1 is in standard form. | 1
- component | 组成部分，分项 | One part of a whole, such as one coordinate of a vector | 整体的组成部分，例如向量的分量。 | The horizontal component of the vector ⟨3, 4⟩ is 3. | 1

@unit 1 | Polynomial and Rational Functions | 多项式函数与有理函数
@topic 1.1 | Functions and Graphs | 函数与图像 | Identify domain and range; Use function notation; Analyze rates of change
- function | 函数 | A relation that assigns each input exactly one output | 每个输入（自变量）都对应唯一输出（因变量）的关系。 | f(x) = 3x + 1 is a function because each x gives one value. | 1
  rel: domain; range; vertical-line test
- input / output | 输入 / 输出 | The value put into a function and the resulting value | 函数中代入的自变量值和得到的函数值。 | For f(x) = x², an input of 3 gives an output of 9. | 1
- independent variable | 自变量 | The input variable whose values are chosen freely | 可以自由取值的变量，通常是 x。 | In h(t), time t is the independent variable. | 1
  vs: dependent variable
- dependent variable | 因变量 | The output variable whose value depends on the input | 取值依赖于自变量的变量。 | Height is the dependent variable in h(t). | 1
  vs: independent variable
- domain | 定义域 | The set of all allowable inputs of a function | 函数所有允许输入值的集合。 | The domain of f(x) = 1/(x − 2) is all real numbers except 2. | 1
  vs: range
- range | 值域 | The set of all outputs of a function | 函数所有输出值组成的集合。 | The range of f(x) = x² is [0, ∞). | 1
  vs: domain
- vertical-line test | 垂线检验法（竖线测试） | A graph is a function if no vertical line crosses it more than once | 若任意竖直线与图像最多只有一个交点，则该图像表示函数。 | A circle fails the vertical-line test, so it is not a function. | 1
- coordinate system | 坐标系 | A system for locating points using ordered pairs relative to axes | 用有序数对表示点的位置的系统，如直角坐标系。 | In the coordinate system, (3, −2) is 3 right and 2 down from the origin. | 1
- origin | 原点 | The point (0, 0) where the axes intersect | 坐标轴的交点 (0, 0)。 | An odd function's graph is symmetric about the origin. | 1
- x-intercept | x轴截距（横截距） | A point where a graph crosses the x-axis (y = 0) | 图像与 x 轴的交点，对应函数的零点。 | The x-intercepts of y = x² − 4 are (−2, 0) and (2, 0). | 1
- y-intercept | y轴截距（纵截距） | The point where a graph crosses the y-axis (x = 0) | 图像与 y 轴的交点。 | The y-intercept of y = 2x + 5 is (0, 5). | 1
- slope | 斜率 | The ratio of vertical change to horizontal change between two points on a line | 直线上两点纵坐标变化与横坐标变化之比，表示变化率。 | A slope of −2 means y decreases by 2 for every 1 increase in x. | 1
- secant line | 割线 | A line through two points on a curve | 过曲线上两点的直线，其斜率等于平均变化率。 | The slope of the secant line from x = 1 to x = 3 is the average rate of change. | 2
  rel: average rate of change
- average rate of change | 平均变化率 | The change in output divided by the change in input over an interval | 区间上函数值变化量与自变量变化量之比 (f(b) − f(a))/(b − a)。 | The average rate of change of f(x) = x² on [1, 3] is 4. | 2
  rel: secant line; slope
  vis: curve secant
- increasing | 递增的（增函数） | A function whose outputs rise as inputs increase on an interval | 在区间上，自变量增大时函数值也增大。 | f(x) = x³ is increasing on all real numbers. | 1
  vs: decreasing
- decreasing | 递减的（减函数） | A function whose outputs fall as inputs increase on an interval | 在区间上，自变量增大时函数值减小。 | f(x) = −2x is decreasing everywhere. | 1
  vs: increasing
- monotonicity | 单调性 | Whether a function is increasing or decreasing on an interval | 函数在区间上递增或递减的性质。 | Analyzing monotonicity tells where a function rises or falls. | 2
- concave up | 凹向上（下凸） | Curving upward; the rate of change is increasing | 图像向上弯，变化率在增大。注意中文“凹/凸”的用法在不同教材中可能相反，以英文定义为准。 | y = x² is concave up everywhere. | 2
  mis: 中文“凸函数”有时指 concave up，有时指 concave down — rely on the English definition (rate of change increasing).
  vs: concave down
  vis: curve concavity
- concave down | 凹向下（上凸） | Curving downward; the rate of change is decreasing | 图像向下弯，变化率在减小。 | y = −x² is concave down everywhere. | 2
  vs: concave up
- concavity | 凹凸性 | Whether a graph is concave up or concave down | 图像弯曲方向的性质，由变化率增大还是减小决定。 | Concavity describes how the rate of change is changing. | 2
- inflection point | 拐点 | A point where a graph changes concavity | 图像凹凸性发生改变的点。 | y = x³ has an inflection point at the origin. | 2
  vs: turning point
- turning point | 转折点 | A point where a graph changes from increasing to decreasing, or vice versa | 函数由增变减或由减变增的点，即局部极值点。 | A cubic function can have at most two turning points. | 2
  vs: inflection point
- local maximum | 局部最大值（极大值） | A value greater than or equal to all nearby function values | 在附近区域内最大的函数值。 | The function has a local maximum of 4 at x = 1. | 2
  vs: absolute maximum
- local minimum | 局部最小值（极小值） | A value less than or equal to all nearby function values | 在附近区域内最小的函数值。 | A parabola opening upward has a local minimum at its vertex. | 2
- relative extremum / local extremum | 相对极值 / 局部极值 | A local maximum or local minimum value | 局部最大值或局部最小值的统称。 | Relative extrema occur at turning points. | 2
- absolute maximum | 绝对最大值（最大值） | The greatest value a function attains on its domain or interval | 函数在定义域（或区间）上取得的最大值。 | On [0, 3], f(x) = x² has an absolute maximum of 9. | 2
  vs: local maximum
- absolute minimum | 绝对最小值（最小值） | The least value a function attains on its domain or interval | 函数在定义域（或区间）上取得的最小值。 | On [−1, 2], f(x) = x² has an absolute minimum of 0. | 2
- absolute extrema | 绝对极值 | The absolute maximum and absolute minimum of a function | 绝对最大值与绝对最小值的统称。 | Absolute extrema on a closed interval occur at critical points or endpoints. | 2
- global maximum / global minimum | 全局最大值 / 全局最小值 | Another name for absolute maximum and minimum | 绝对最大值/最小值的另一种说法。 | The global minimum of f(x) = (x − 1)² is 0. | 2
- extreme value theorem | 极值定理 | A continuous function on a closed interval attains both an absolute maximum and an absolute minimum | 闭区间上的连续函数一定能取到最大值和最小值。 | Because f is continuous on [1, 4], the extreme value theorem guarantees a maximum exists. | 3
  rel: closed interval; continuous
- end behavior | 末端行为（端部趋势） | How a function's outputs behave as x → ∞ or x → −∞ | 当 x 趋于正负无穷时函数值的变化趋势，多项式由首项决定。 | The end behavior of f(x) = −x³ is f → −∞ as x → ∞. | 2
  rel: leading term
- unbounded | 无界的 | Having outputs that grow without limit | 函数值可以无限增大（或减小）。 | f(x) = x² is unbounded above. | 2
- smooth | 光滑的 | Having no sharp corners or breaks | 图像没有尖角和断点。 | Polynomial graphs are smooth and continuous. | 1
- continuous | 连续的 | Having no breaks, jumps or holes in an interval | 图像在区间内没有断开、跳跃或空洞。 | Polynomials are continuous for all real numbers. | 1
- symmetric / symmetry | 对称的 / 对称性 | A graph is symmetric if a reflection maps it onto itself | 图像经过某种翻折后与自身重合。 | The graph of y = x² is symmetric about the y-axis. | 1
- parity | 奇偶性 | Whether a function is even, odd or neither | 函数是偶函数、奇函数还是非奇非偶。 | Checking parity tells you whether the graph has y-axis or origin symmetry. | 2
- even function | 偶函数 | A function with f(−x) = f(x); its graph is symmetric about the y-axis | 满足 f(−x) = f(x) 的函数，图像关于 y 轴对称。 | f(x) = x⁴ is an even function. | 2
  vs: odd function
- odd function | 奇函数 | A function with f(−x) = −f(x); its graph is symmetric about the origin | 满足 f(−x) = −f(x) 的函数，图像关于原点对称。 | f(x) = x³ is an odd function. | 2
  vs: even function
- explicit form | 显式 | An equation solved for the dependent variable, such as y = f(x) | 因变量单独写在一边的形式。 | y = 2x + 1 is in explicit form. | 2
  vs: implicit form
- implicit form | 隐式 | An equation not solved for the dependent variable | 未把因变量单独解出的形式，如 x² + y² = 1。 | The circle x² + y² = 25 is given in implicit form. | 2
  vs: explicit form
- piecewise-defined function | 分段函数 | A function defined by different formulas on different parts of its domain | 在定义域不同区间上用不同表达式定义的函数。 | Tax brackets can be modeled by a piecewise-defined function. | 2
- greatest integer function | 取整函数（高斯函数） | The function ⌊x⌋ giving the greatest integer less than or equal to x | 取不超过 x 的最大整数。 | ⌊3.7⌋ = 3 and ⌊−1.2⌋ = −2. | 2
- composite function | 复合函数 | A function formed by applying one function to the output of another, (f ∘ g)(x) = f(g(x)) | 把一个函数的输出作为另一个函数的输入得到的函数。 | If f(x) = x² and g(x) = x + 1, then f(g(2)) = 9. | 2
- transformation | 变换 | A change to a graph's position, size or orientation | 对图像进行平移、伸缩或翻折。 | y = (x − 2)² + 3 is a transformation of y = x². | 1
- shift | 平移 | Moving a graph horizontally or vertically without changing its shape | 图像沿水平或竖直方向移动。 | y = f(x − 3) shifts the graph of f 3 units right. | 1
  mis: f(x − 3) shifts left — it shifts RIGHT by 3.
- dilation | 扩张，扩大 | Stretching or compressing a graph by a factor | 图像按某个因子伸长或压缩。 | y = 3f(x) is a vertical dilation by a factor of 3. | 2
- reflection | 反射，翻折 | Flipping a graph over a line | 图像关于某条直线翻折。 | y = −f(x) reflects the graph over the x-axis. | 1
- best fit | 最佳拟合 | The model that most closely matches a set of data | 与数据最接近的模型（如回归直线）。 | A cubic model may give the best fit for data with two turning points. | 2
- scatter plot | 散点图 | A graph of paired data points | 把成对数据画成点的图，用来观察变量关系。 | A scatter plot of temperature vs. sales shows a positive trend. | 1
- constant function | 常函数 | A function whose output is the same for every input | 无论输入为何，输出都相同的函数，如 f(x) = 5。 | The graph of a constant function is a horizontal line. | 1
- constant | 常数的，恒定的 | A fixed value that does not change | 不变的量。 | In y = mx + b, b is a constant. | 1
- limit | 极限 | The value a function's outputs approach as the input approaches a value | 当自变量趋近某值时，函数值无限接近的数。 | As x → ∞, the limit of 1/x is 0. | 2
- approach | 趋近（于） | To get closer and closer to a value | 越来越接近某个值。 | As x approaches 2 from the left, f(x) approaches 5. | 1
@topic 1.2 | Polynomials | 多项式 | Relate zeros, factors and multiplicity; Use the remainder and factor theorems
- coefficient | 系数 | A number multiplying a variable term | 与变量相乘的数。 | In 4x³, the coefficient is 4. | 1
- constant term | 常数项 | The term with no variable | 不含变量的项。 | The constant term of x² − 3x + 7 is 7. | 1
- degree | 次数（最高次数） | The highest exponent of the variable in a polynomial | 多项式中变量的最高次数。 | The degree of 2x⁵ − x + 1 is 5. | 1
- leading term | 首项（最高次项） | The term with the highest degree | 次数最高的项，决定末端行为。 | The leading term of 3 − x + 2x⁴ is 2x⁴. | 1
- leading coefficient | 首项系数 | The coefficient of the leading term | 最高次项的系数。 | A negative leading coefficient on an even-degree polynomial makes both ends point down. | 1
- descending order | 降幂（降序）排列 | Writing terms from highest to lowest degree | 按次数从高到低排列各项。 | In descending order, 3 + x² − x becomes x² − x + 3. | 1
- linear function | 线性函数（一次函数） | A function of the form f(x) = mx + b | 形如 f(x) = mx + b 的函数，图像为直线，变化率恒定。 | A linear function has a constant rate of change. | 1
- quadratic function | 二次函数 | A function of the form f(x) = ax² + bx + c with a ≠ 0 | 形如 ax² + bx + c（a≠0）的函数，图像为抛物线。 | The quadratic function f(x) = x² − 4x + 3 has its vertex at x = 2. | 1
- quadratic equation | 一元二次方程 | An equation that can be written as ax² + bx + c = 0 with a ≠ 0 | 可化为 ax² + bx + c = 0（a≠0）的方程。 | The quadratic equation x² − 5x + 6 = 0 has roots 2 and 3. | 1
- quadratic inequality | 一元二次不等式 | An inequality involving a quadratic expression | 含二次式的不等式，解集通常是区间。 | The quadratic inequality x² − 1 > 0 has solution x < −1 or x > 1. | 2
- discriminant | 判别式（Δ = b²-4ac） | The quantity b² − 4ac that determines the number and type of roots | Δ > 0 两个不同实根，Δ = 0 一个重根，Δ < 0 无实根。 | Since the discriminant is negative, the equation has no real solutions. | 2
- parabola | 抛物线 | The U-shaped graph of a quadratic function | 二次函数的图像。 | The parabola y = −x² opens downward. | 1
- cubic function | 三次函数 | A polynomial function of degree 3 | 最高次数为 3 的多项式函数。 | A cubic function always has at least one real zero. | 1
- cubic model | 三次（多项式）模型 | A degree-3 polynomial used to model data | 用三次多项式拟合数据的模型。 | The data has two turning points, so a cubic model may fit well. | 2
- quartic function | 四次函数 | A polynomial function of degree 4 | 最高次数为 4 的多项式函数。 | A quartic function can have up to three turning points. | 2
- power function | 幂函数 | A function of the form f(x) = axⁿ | 形如 f(x) = axⁿ 的函数。 | f(x) = 2x³ is a power function. | 2
- zero polynomial | 零多项式 | The polynomial whose coefficients are all zero | 所有系数都为零的多项式，其次数通常不定义。 | The zero polynomial has no defined degree. | 2
- zeros of a function | 函数的零点 | Input values that make the function equal zero | 使函数值为零的自变量值，即图像与 x 轴交点的横坐标。 | The zeros of f(x) = (x − 1)(x + 4) are 1 and −4. | 1
  rel: x-intercept; factor theorem
- real zero | 实数零点 | A zero of a function that is a real number | 是实数的零点，对应 x 轴交点。 | x² + 1 has no real zeros. | 1
- multiplicity | 重数 | The number of times a factor appears in a polynomial's factorization | 因式在因式分解中出现的次数。偶数重数时图像在该点“触碰”x 轴，奇数重数时“穿过”。 | Because (x − 2)² has multiplicity 2, the graph touches the x-axis at x = 2. | 2
- a zero of multiplicity 2 | 二重根 | A zero whose factor appears exactly twice | 因式出现两次的零点，图像在此处与 x 轴相切。 | x = 3 is a zero of multiplicity 2 of (x − 3)²(x + 1). | 2
- factor | 因式，因子 | An expression that divides another exactly | 能整除另一个表达式的式子。 | (x − 2) is a factor of x² − 4. | 1
- common factors | 公因式 | Factors shared by two or more terms | 多个项共有的因式。 | The common factor of 6x² and 9x is 3x. | 1
- factor theorem | 因式定理 | (x − c) is a factor of p(x) if and only if p(c) = 0 | p(c) = 0 当且仅当 (x − c) 是 p(x) 的因式。 | Since p(2) = 0, the factor theorem tells us (x − 2) is a factor. | 2
  vs: remainder theorem
- remainder theorem | 余数定理 | When p(x) is divided by (x − c), the remainder is p(c) | 多项式 p(x) 除以 (x − c) 的余数等于 p(c)。 | By the remainder theorem, dividing x³ + 1 by (x − 1) leaves remainder 2. | 2
  vs: factor theorem
- polynomial division | 多项式除法 | Dividing one polynomial by another using long or synthetic division | 用长除法或综合除法进行多项式相除。 | Polynomial division shows (x² − 1) ÷ (x − 1) = x + 1. | 2
- dividend | 被除数 | The quantity being divided | 被除的数或式。 | In 12 ÷ 3, the dividend is 12. | 1
- divisor | 除数 | The quantity by which another is divided | 用来去除的数或式。 | In 12 ÷ 3, the divisor is 3. | 1
- quotient | 商 | The result of division | 除法的结果。 | The quotient of 12 ÷ 3 is 4. | 1
- remainder | 余数 | The amount left over after division | 除法后剩下的部分。 | 17 ÷ 5 has remainder 2. | 1
- rational zeros theorem | 有理根定理 | Any rational zero of a polynomial with integer coefficients has the form p/q, where p divides the constant term and q divides the leading coefficient | 整系数多项式的有理根必为 p/q 形式（p 整除常数项，q 整除首项系数）。 | For 2x³ − 3x + 1, possible rational zeros include ±1 and ±1/2. | 3
- Descartes' Rule of Signs | 笛卡尔符号法则 | The number of positive real zeros equals the number of sign changes in the coefficients, or less by an even number | 正实根个数等于系数符号变化次数，或比它少偶数个。 | x³ − x² + x − 1 has three sign changes, so it has 3 or 1 positive real zeros. | 3
- intermediate value theorem | 中间值定理（介值定理） | If f is continuous on [a, b], it takes every value between f(a) and f(b) | 闭区间上连续的函数可以取到 f(a) 与 f(b) 之间的任何值。 | Since f(1) < 0 < f(2) and f is continuous, a zero exists between 1 and 2. | 3
@topic 1.3 | Rational Functions and Radicals | 有理函数与根式 | Identify asymptotes and holes; Simplify radical expressions
- rational function | 有理函数 | A ratio of two polynomials, with the denominator not the zero polynomial | 两个多项式之比的函数。 | f(x) = (x + 1)/(x − 3) is a rational function. | 2
- reciprocal function | 反比例函数 | The function f(x) = 1/x | f(x) = 1/x，图像是双曲线，有水平与竖直渐近线。 | The reciprocal function has a vertical asymptote at x = 0. | 1
- numerator | 分子 | The top of a fraction | 分数线上方的部分。 | In 3/4, the numerator is 3. | 1
- denominator | 分母 | The bottom of a fraction | 分数线下方的部分，不能为零。 | Setting the denominator equal to zero finds excluded values. | 1
- lowest terms | 最简形式 | A fraction whose numerator and denominator share no common factors | 分子分母没有公因式的分数。 | 6/8 in lowest terms is 3/4. | 1
- asymptote | 渐近线 | A line that a graph approaches but does not reach as x or y grows without bound | 图像无限接近但（通常）不达到的直线。 | y = 0 is a horizontal asymptote of y = 1/x. | 2
- vertical asymptote | 垂直渐近线 | A vertical line x = a where outputs grow without bound | 当 x → a 时函数值趋于无穷的竖直线，常出现在分母为零（且不被约去）的位置。 | f(x) = 1/(x − 2) has a vertical asymptote at x = 2. | 2
  vs: hole
- hole | 空心（空洞） | A single missing point on a graph caused by a canceled common factor | 分子分母有公因式被约去时，图像上缺失的一个点。 | f(x) = (x² − 1)/(x − 1) has a hole at x = 1. | 2
  vs: vertical asymptote
- oblique | 倾斜的 | Slanted; neither horizontal nor vertical | 倾斜的。斜渐近线出现在分子次数比分母高一次时。 | f(x) = (x² + 1)/x has an oblique asymptote y = x. | 3
- intersect | 相交，交叉 | To cross or meet at a point | 两图像在某点相遇。 | The graphs intersect where f(x) = g(x). | 1
- absolute value | 绝对值 | The distance of a number from zero on the number line | 数在数轴上到原点的距离，总是非负。 | |−5| = 5. | 1
- absolute value function | 绝对值函数 | The function f(x) = |x| | 图像为 V 形的函数。 | The graph of y = |x − 2| has its vertex at (2, 0). | 1
- square root | 平方根 | A value that, multiplied by itself, gives the original number | 平方等于原数的数。√ 符号表示非负的算术平方根。 | √49 = 7, although both 7 and −7 square to 49. | 1
- cube root | 立方根 | A value that, cubed, gives the original number | 立方等于原数的数，负数也有实数立方根。 | The cube root of −8 is −2. | 1
- radical | 根式 | An expression containing a root symbol | 含根号的表达式。 | √(x + 1) is a radical expression. | 1
- radicand | 被开方数 | The expression under a radical sign | 根号下的数或式。 | In √(2x), the radicand is 2x. | 1
- index | 指数、根指数 | The small number indicating which root is taken | 根号上的小数字，表示开几次方。 | In ∛x, the index is 3. | 1

@unit 2 | Exponential and Logarithmic Functions | 指数函数与对数函数
@topic 2.1 | Exponential and Logarithmic Models | 指数与对数模型 | Model growth and decay; Use logarithms to solve exponential equations
- arithmetic sequence | 等差数列 | A sequence with a constant difference between consecutive terms | 相邻两项之差为常数的数列，对应线性函数。 | 3, 7, 11, 15 is an arithmetic sequence with common difference 4. | 1
  vs: geometric sequence
- geometric sequence | 等比数列 | A sequence with a constant ratio between consecutive terms | 相邻两项之比为常数的数列，对应指数函数。 | 2, 6, 18, 54 is a geometric sequence with ratio 3. | 1
  vs: arithmetic sequence
- exponential function | 指数函数 | A function of the form f(x) = abˣ, with b > 0 and b ≠ 1 | 形如 f(x) = abˣ 的函数。相等的输入间隔对应相等的输出比值。 | f(x) = 100(1.05)ˣ models 5% annual growth. | 2
  vs: power function
- growth factor | 增长因子 | The base b in an exponential model; the ratio of output change per unit input | 指数模型中的底数 b，b > 1 为增长，0 < b < 1 为衰减。 | A growth factor of 0.8 means the quantity loses 20% per period. | 2
- exponential decay | 指数衰减 | Decrease by a constant percentage per unit time | 每单位时间按固定百分比减少。 | Radioactive material undergoes exponential decay. | 2
- logarithm | 对数 | The exponent to which a base must be raised to produce a number: log_b(x) = y means bʸ = x | 对数是指数：若 bʸ = x，则 log_b x = y。 | log₂(8) = 3 because 2³ = 8. | 2
  rel: exponential function; inverse function
- inverse function | 反函数 | A function that reverses another function's input-output pairs | 把原函数的输入和输出互换的函数，图像关于 y = x 对称。 | ln x and eˣ are inverse functions. | 2
- natural logarithm | 自然对数 | The logarithm with base e, written ln x | 以 e 为底的对数。 | ln(e³) = 3. | 2
- semi-log plot | 半对数图 | A graph with a logarithmic scale on one axis, on which exponential data appear linear | 一个坐标轴取对数刻度的图，指数数据在其上呈直线。 | Exponential growth data form a straight line on a semi-log plot. | 3

@unit 3 | Trigonometric and Polar Functions | 三角函数与极坐标函数
@topic 3.1 | Periodic Functions | 周期函数 | Model periodic phenomena with sinusoidal functions
- periodic function | 周期函数 | A function whose outputs repeat at regular intervals | 函数值每隔固定间隔重复出现的函数。 | Daylight hours over a year can be modeled by a periodic function. | 2
  rel: period; sinusoidal function
- period | 周期 | The length of the smallest interval over which a periodic function repeats | 周期函数重复一次所需的最小区间长度。y = sin(bx) 的周期为 2π/b。 | The period of y = sin(2x) is π. | 2
- amplitude | 振幅 | Half the distance between the maximum and minimum values of a sinusoidal function | 正弦型函数最大值与最小值差的一半。 | y = 3sin x has amplitude 3. | 1
- unit circle | 单位圆 | A circle of radius 1 centered at the origin, used to define sine and cosine | 以原点为圆心、半径为 1 的圆，角 θ 的终边与它的交点为 (cos θ, sin θ)。 | On the unit circle, the point at θ = π/2 is (0, 1). | 2
- radian | 弧度 | The angle subtended by an arc equal in length to the radius | 弧长等于半径时所对的圆心角，2π 弧度 = 360°。 | 180° equals π radians. | 2
- sinusoidal function | 正弦型函数 | A function of the form f(x) = a·sin(b(x − h)) + k or its cosine equivalent | 形如 a·sin(b(x−h)) + k 的函数，用来模拟周期现象。 | Tide heights are often modeled with a sinusoidal function. | 2
  vis: curve sine
- polar coordinates | 极坐标 | Locating a point by its distance r from the origin and angle θ | 用到原点的距离 r 和角度 θ 表示点 (r, θ)。 | The point (2, π/2) in polar coordinates is (0, 2) in rectangular coordinates. | 3

@unit 4 | Geometry and Algebra Language | 几何与代数用语
@topic 4.1 | Geometry Words | 几何用语 | Recognize geometry vocabulary used in AP math problems
- perpendicular | 垂直的 | Meeting at a right angle (90°) | 两条直线相交成直角。垂直直线的斜率互为负倒数。 | Lines with slopes 2 and −1/2 are perpendicular. | 1
  vs: parallel
- parallel | 平行的 | Lines in a plane that never meet; they have equal slopes | 同一平面内永不相交的直线，斜率相等。 | y = 3x + 1 and y = 3x − 4 are parallel. | 1
  vs: perpendicular
- bisector | 平分线 | A line, ray or segment that divides something into two equal parts | 把线段或角分成相等两部分的线。 | The perpendicular bisector of a segment passes through its midpoint at a right angle. | 2
- midpoint | 中点 | The point that divides a segment into two equal parts | 把线段分成相等两段的点，坐标为两端点坐标的平均值。 | The midpoint of (0, 0) and (4, 6) is (2, 3). | 1
- tangent line | 切线 | A line that touches a curve at a point and has the curve's slope there | 在某点与曲线“相切”、斜率等于曲线在该点瞬时变化率的直线。 | The tangent line to a circle is perpendicular to the radius. | 2
  vs: secant line
- vertex | 顶点 | A corner point, or the turning point of a parabola | 角的顶点或抛物线的转折点。 | The vertex of y = (x − 1)² + 2 is (1, 2). | 1
- hypotenuse | 斜边 | The side opposite the right angle in a right triangle | 直角三角形中直角所对的边，也是最长的边。 | In a 3-4-5 triangle, the hypotenuse is 5. | 1
- congruent | 全等的 | Having the same size and shape | 形状和大小完全相同。 | Two triangles with all three sides equal are congruent. | 1
  vs: similar
- similar | 相似的 | Having the same shape but not necessarily the same size | 形状相同，对应边成比例。 | Similar triangles have proportional sides. | 1
  vs: congruent
- cross section | 横截面 | The shape formed when a solid is cut by a plane | 用平面截立体所得到的图形。 | A cross section of a cylinder perpendicular to its axis is a circle. | 2
@topic 4.2 | Reasoning Words | 推理用语 | Recognize the verbs used in math problems
- derive | 推导 | To obtain a formula or result through logical steps | 通过逻辑步骤得到公式或结论。 | Derive the quadratic formula by completing the square. | 2
- prove | 证明 | To show that a statement is true for all cases using valid reasoning | 用严格的推理说明命题在所有情况下都成立。 | Prove that the sum of two even numbers is even. | 2
  vs: verify
- verify | 验证 | To check that a given result is correct, often by substitution | 检验给定结果是否正确，常用代入法。 | Verify that x = 2 is a solution by substituting it. | 1
  vs: prove
- simplify | 化简 | To rewrite an expression in a simpler equivalent form | 把表达式写成更简单的等价形式。 | Simplify (x² − 9)/(x − 3) to x + 3 for x ≠ 3. | 1
- substitute | 代入 | To replace a variable with a value or expression | 用数值或式子替换变量。 | Substitute t = 3 into h(t) to find the height. | 1
- respectively | 分别地 | In the order given | 按所列顺序一一对应。 | The roots are 2 and 5, and the corresponding y-values are 4 and 25, respectively. | 2
- hence | 因此 | As a consequence; for this reason | 由此可得，表示推理结论。 | f(2) = 0; hence (x − 2) is a factor. | 2

# ---------------- Practice items (original) ----------------
@q pc-u0-001 | UNDERSTAND | CONCEPT | MCQ | 0 | 3 | necessary condition; sufficient condition
? "If a function is differentiable at x = a, then it is continuous at x = a." Which statement is correct?
=* Continuity is a necessary condition for differentiability. :: Correct — differentiability implies continuity, so continuity must be present.
= Continuity is a sufficient condition for differentiability. :: |x| is continuous at 0 but not differentiable there.
= Differentiability is a necessary condition for continuity. :: Many continuous functions are not differentiable.
= The two conditions are equivalent. :: They are not equivalent — the implication goes one way.
! If p ⇒ q, then p is sufficient for q and q is necessary for p. Here p = differentiable, q = continuous.
!zh 若 p ⇒ q，则 p 是 q 的充分条件，q 是 p 的必要条件。这里 p = 可导，q = 连续。
@q pc-u1-001 | APPLY | APPLICATION | MCQ | 1 | 2 | hole; vertical asymptote
? f(x) = (x² − 4)/(x − 2). What happens on the graph at x = 2?
= A vertical asymptote :: The factor (x − 2) cancels, so there is no asymptote.
=* A hole :: Correct — after canceling, f(x) = x + 2 with x ≠ 2, leaving a hole at (2, 4).
= An x-intercept :: f(2) is undefined, so there is no intercept there.
= A turning point :: The simplified function is linear.
! A canceled common factor creates a hole; an uncanceled zero of the denominator creates a vertical asymptote.
!zh 被约去的公因式产生空洞；分母中未被约去的零点产生垂直渐近线。
@q pc-u1-002 | UNDERSTAND | CONCEPT | MCQ | 1 | 2 | multiplicity
? The graph of a polynomial touches the x-axis at x = 3 and turns around without crossing. What can be concluded?
=* x = 3 is a zero of even multiplicity. :: Correct — even multiplicity makes the graph bounce.
= x = 3 is a zero of odd multiplicity. :: Odd multiplicity makes the graph cross.
= x = 3 is not a zero. :: The graph touches the axis, so f(3) = 0.
= The polynomial has degree 3. :: Degree cannot be determined from one zero.
! Even multiplicity → graph touches and turns; odd multiplicity → graph crosses.
!zh 偶数重根：图像与 x 轴相切后折返；奇数重根：图像穿过 x 轴。
@q pc-u1-003 | APPLY | APPLICATION | CLOZE | 1 | 2 | average rate of change
? The ______ of f on [a, b] is (f(b) − f(a))/(b − a), the slope of the secant line.
a: average rate of change|average rate
! The average rate of change equals the slope of the secant line between the two endpoints.
!zh 平均变化率等于两端点之间割线的斜率。

@pair factor-vs-remainder | factor theorem | remainder theorem
! The remainder theorem gives the remainder p(c) when dividing by (x − c); the factor theorem is the special case where that remainder is 0.
!zh 余数定理：除以 (x − c) 的余数是 p(c)；因式定理是余数为 0 的特殊情况。
d: Statement :: (x − c) is a factor ⇔ p(c) = 0 :: Remainder of p(x) ÷ (x − c) is p(c)
s: A :: Because p(4) = 0, (x − 4) divides p(x) exactly. :: Zero remainder ⇒ factor.
s: B :: Dividing x³ + 2 by (x − 1) leaves 3. :: Finding a remainder.
s: B :: Evaluate p(−2) to find the remainder after dividing by (x + 2). :: Remainder theorem.
s: A :: Show that (x + 1) is a factor by checking p(−1) = 0. :: Factor theorem.
@pair hole-vs-asymptote | hole | vertical asymptote
! A hole comes from a canceled common factor; a vertical asymptote comes from a denominator zero that does NOT cancel.
!zh 空洞来自被约去的公因式；垂直渐近线来自未被约去的分母零点。
s: A :: f(x) = (x − 1)(x + 2)/(x − 1) at x = 1. :: The factor cancels.
s: B :: f(x) = 1/(x − 5) at x = 5. :: Outputs grow without bound.
s: B :: As x → 2⁺, f(x) → ∞. :: Unbounded behavior = asymptote.
s: A :: The graph is a line with one missing point. :: A single removable gap.
@pair necessary-vs-sufficient | necessary condition | sufficient condition
! If p ⇒ q: p is SUFFICIENT for q (p guarantees q), and q is NECESSARY for p (without q, no p).
!zh 若 p ⇒ q：p 是 q 的充分条件（有 p 必有 q），q 是 p 的必要条件（无 q 必无 p）。
s: A :: You must have a ticket to enter the concert, but a ticket alone may not get you in. :: Required but not enough.
s: B :: Scoring 100 guarantees you passed. :: Guarantees the result.
s: B :: Being a square guarantees being a rectangle. :: Square ⇒ rectangle.
s: A :: Being a rectangle is required for being a square. :: Required, not guaranteed.
