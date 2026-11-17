# AP Calculus AB — master IDs 07-xxx plus AP Lexicon research expansion. Pending teacher review.
@subject ap-calculus-ab | AP Calculus AB | AP 微积分 AB | Calc AB | blue | 7
@desc Limits, derivatives, integrals and differential equations — the language of change.
@framework Unit titles follow the AP Calculus AB course framework (8 units).

@unit 1 | Limits and Continuity | 极限与连续
- limit | 极限 | The value a function approaches as the input approaches a given value | 当 x 趋近 a 时 f(x) 无限接近的值。极限与 f(a) 本身是否存在、是否相等无关。 | Even though f(2) is undefined, the limit of f(x) as x → 2 can still exist. | 1 | #07-001
  mis: The limit is just f(a) — a limit describes nearby behavior and can exist even when f(a) is undefined.
  rel: one-sided limit; continuity
  vis: curve limit
- one-sided limit | 单侧极限 | The value a function approaches as x approaches a from only the left or only the right | 只从左侧（x→a⁻）或右侧（x→a⁺）趋近时的极限。两侧极限相等时极限才存在。 | If the left- and right-hand limits differ at x = 3, the limit does not exist there. | 2
  rel: limit; jump discontinuity
- continuity | 连续性 | A function is continuous at a if f(a) exists, the limit exists, and they are equal | 在 x = a 处连续需满足三个条件：f(a) 有定义，极限存在，极限等于 f(a)。 | To show f is continuous at x = 1, verify all three conditions of continuity. | 2 | #07-002
  rel: limit; intermediate value theorem
  vs: differentiability
- removable discontinuity | 可去间断点 | A hole in the graph where the limit exists but does not equal the function value | 极限存在但不等于函数值（或函数值不存在）的点，图像上表现为空心点。 | Redefining f at a removable discontinuity can make f continuous. | 2
  vs: jump discontinuity
- jump discontinuity | 跳跃间断点 | A break where the left- and right-hand limits exist but are not equal | 左右极限都存在但不相等的间断点。 | A piecewise function with a jump at x = 0 is not continuous there. | 2
  vs: removable discontinuity
- squeeze theorem | 夹逼定理 | If g(x) ≤ f(x) ≤ h(x) and g and h share a limit L, then f also has limit L | 若函数被两个极限相同的函数夹住，则它的极限也等于 L。 | The squeeze theorem shows that sin(x)/x → 1 as x → 0. | 3
- intermediate value theorem | 介值定理 | A continuous function on [a, b] takes every value between f(a) and f(b) | 闭区间上的连续函数取遍 f(a) 与 f(b) 之间的所有值。使用前必须说明函数连续。 | Because f is continuous and f(1) < 0 < f(3), there is a c in (1, 3) with f(c) = 0. | 2
  mis: IVT applies to any function — it requires continuity on a closed interval.

@unit 2 | Differentiation: Definition and Fundamental Properties | 导数：定义与基本性质
- derivative | 导数 | The instantaneous rate of change of a function, the limit of the difference quotient | 函数的瞬时变化率，几何意义是切线斜率，定义为差商的极限。 | If s(t) is position, the derivative s′(t) is velocity. | 2 | #07-003
  rel: tangent line; difference quotient
  vis: curve tangent
- difference quotient | 差商 | The expression [f(x + h) − f(x)]/h, the slope of a secant line | 割线斜率的表达式，h→0 时的极限即为导数。 | Taking the limit of the difference quotient as h → 0 gives f′(x). | 2
  rel: derivative; average rate of change
- differentiability | 可导性 | The existence of a finite derivative at a point | 在某点导数存在。可导一定连续，但连续不一定可导（如尖点、竖直切线）。 | f(x) = |x| is continuous at 0 but not differentiable there because of the corner. | 2 | #07-004
  mis: Continuous functions are always differentiable — corners, cusps and vertical tangents break differentiability.
  vs: continuity
- power rule | 幂法则 | d/dx[xⁿ] = nxⁿ⁻¹ | 幂函数的求导法则。 | By the power rule, the derivative of x⁵ is 5x⁴. | 1
- tangent line | 切线 | The line through a point on a curve with slope equal to the derivative there | 过曲线上一点、斜率等于该点导数的直线，可用于局部线性近似。 | The tangent line to y = x² at x = 3 has slope 6. | 2
  vs: secant line

@unit 3 | Differentiation: Composite, Implicit, and Inverse Functions | 复合、隐函数与反函数求导
- chain rule | 链式法则 | The derivative of f(g(x)) is f′(g(x))·g′(x) | 复合函数求导：外层函数的导数（代入内层）乘以内层函数的导数。 | By the chain rule, d/dx[sin(3x)] = 3cos(3x). | 2 | #07-005
  mis: Forgetting the inner derivative — always multiply by g′(x).
- product rule | 乘积求导法则 | d/dx[f·g] = f′g + fg′ | 两函数乘积的导数。 | The product rule gives d/dx[x² eˣ] = 2x eˣ + x² eˣ. | 2 | #07-006
  vs: quotient rule
- quotient rule | 商的求导法则 | d/dx[f/g] = (f′g − fg′)/g² | 两函数商的导数，注意分子顺序。 | Use the quotient rule to differentiate (x + 1)/(x − 1). | 2 | #07-007
  vs: product rule
- implicit differentiation | 隐函数求导 | Differentiating both sides of an equation with respect to x, treating y as a function of x | 方程两边同时对 x 求导，把 y 看作 x 的函数，含 y 的项要乘 dy/dx。 | Implicit differentiation of x² + y² = 25 gives dy/dx = −x/y. | 3 | #07-008

@unit 4 | Contextual Applications of Differentiation | 导数的实际应用
- related rates | 相关变化率 | Problems relating the rates of change of connected quantities | 若干相关量同时随时间变化，通过对关系式关于时间求导来求未知变化率。 | As a balloon inflates, related rates connect dV/dt to dr/dt. | 3 | #07-009
- linearization | 线性近似 | Using the tangent line to approximate a function near a point | 用切线方程近似函数值：L(x) = f(a) + f′(a)(x − a)。 | Use the linearization of √x at x = 9 to estimate √9.1. | 2
- L'Hôpital's rule | 洛必达法则 | For limits of the form 0/0 or ∞/∞, the limit of f/g equals the limit of f′/g′ | 遇到 0/0 或 ∞/∞ 型未定式时，可分别对分子分母求导后再求极限。必须先验证形式。 | L'Hôpital's rule shows that the limit of (eˣ − 1)/x as x → 0 is 1. | 3
  mis: Use the quotient rule on f/g — L'Hôpital differentiates numerator and denominator separately.
- particle motion | 质点运动 | Using derivatives of position to describe velocity, acceleration and speed | 位置 s(t) 的导数是速度 v(t)，再求导得加速度 a(t)；速率是 |v(t)|。 | A particle is speeding up when its velocity and acceleration have the same sign. | 2
  mis: A particle speeds up when acceleration is positive — it speeds up when v and a have the SAME sign.

@unit 5 | Analytical Applications of Differentiation | 导数的分析应用
- mean value theorem | 中值定理 | If f is continuous on [a, b] and differentiable on (a, b), some c has f′(c) equal to the average rate of change | 满足条件时，至少存在一点的瞬时变化率等于区间上的平均变化率。 | By the MVT, a car averaging 60 mph must at some moment travel exactly 60 mph. | 3
  rel: average rate of change
- critical point | 临界点 | An interior point where f′(x) = 0 or f′(x) does not exist | 导数为零或不存在的内点，是局部极值的“候选点”。 | Not every critical point is an extremum: f(x) = x³ has a critical point at 0 but no extremum. | 2 | #07-010
  mis: Every critical point is a max or min — f′ must change sign.
- local maximum | 局部极大值 | A function value greater than all nearby values | 在附近所有点中最大的函数值。一阶导数由正变负的点是局部极大值。 | f has a local maximum where f′ changes from positive to negative. | 2 | #07-011
- first derivative test | 一阶导数检验 | Classifying critical points by the sign change of f′ | 根据 f′ 在临界点两侧的符号变化判断极大或极小值。 | Since f′ changes from − to +, the first derivative test gives a local minimum. | 2
- concavity | 凹凸性 | The direction a graph curves, determined by whether f′ is increasing or decreasing | f″ > 0 时上凹（凹向上），f″ < 0 时下凹。 | When f″(x) > 0, f′ is increasing, so the graph is concave up. | 2 | #07-012
  vis: curve concavity
- inflection point | 拐点 | A point where the graph changes concavity | 凹凸性改变的点，此时 f″ 改变符号（仅 f″ = 0 不够）。 | f(x) = x⁴ has f″(0) = 0 but no inflection point at 0. | 2 | #07-013
  mis: f″ = 0 means inflection point — the sign of f″ must change.
- candidates test | 候选点检验法 | Finding absolute extrema on a closed interval by evaluating critical points and endpoints | 闭区间上求最值：比较所有临界点和端点的函数值。 | Use the candidates test to find the absolute maximum on [0, 4]. | 2

@unit 6 | Integration and Accumulation of Change | 积分与变化的累积
- antiderivative | 原函数 | A function whose derivative is the given function | 导数等于给定函数的函数，不定积分结果要加常数 C。 | x³/3 + C is an antiderivative of x². | 2 | #07-014
- definite integral | 定积分 | The signed accumulation of a function over an interval | 函数在区间上的有向累积量（面积可正可负）。 | The definite integral of a velocity function gives displacement. | 2 | #07-015
  mis: The definite integral is always area — area below the axis counts as negative.
  rel: Riemann sum; fundamental theorem of calculus
  vis: curve area
- Riemann sum | 黎曼和 | An approximation of a definite integral using a sum of rectangle areas | 用小矩形面积之和近似定积分（左、右、中点）；梯形法则用梯形。 | A left Riemann sum underestimates the integral of an increasing function. | 2 | #07-017
  vis: riemann
- fundamental theorem of calculus | 微积分基本定理 | The theorem linking derivatives and integrals: ∫ₐᵇ f′(x)dx = f(b) − f(a), and d/dx ∫ₐˣ f(t)dt = f(x) | 揭示微分与积分互逆关系的定理：定积分可由原函数计算；积分上限函数的导数等于被积函数。 | By the FTC, the net change in water volume equals the integral of the flow rate. | 3 | #07-016
- accumulation function | 累积函数 | A function defined by an integral with a variable limit, F(x) = ∫ₐˣ f(t)dt | 以变上限积分定义的函数，表示从 a 到 x 的累积量。 | If F(x) = ∫₀ˣ r(t)dt, then F′(x) = r(x). | 3
- u-substitution | 换元积分法 | An integration technique that reverses the chain rule | 积分换元法，逆用链式法则。 | Use u-substitution with u = x² + 1 to integrate 2x(x² + 1)³. | 2

@unit 7 | Differential Equations | 微分方程
- differential equation | 微分方程 | An equation relating a function to its derivatives | 含有未知函数及其导数的方程。 | dy/dt = 0.3y is a differential equation modeling exponential growth. | 2
- slope field | 斜率场 | A graph of short segments showing the slope dy/dx at many points | 在平面上许多点画出斜率小线段的图，用来直观表示微分方程的解曲线。 | A slope field with horizontal segments along y = 2 shows an equilibrium solution. | 2
- separable differential equation | 可分离变量微分方程 | A differential equation that can be written as g(y)dy = f(x)dx | 可以把 y 和 x 分到等式两边分别积分的微分方程。 | dy/dx = xy is separable: (1/y)dy = x dx. | 3 | #07-018
- general solution | 通解 | A family of solutions to a differential equation containing an arbitrary constant | 含任意常数的解；给定初值条件后得到特解。 | The general solution of dy/dx = 2x is y = x² + C. | 2
  vs: particular solution
- particular solution | 特解 | The solution satisfying a given initial condition | 满足初始条件的那一个解。 | With y(0) = 3, the particular solution is y = x² + 3. | 2
  vs: general solution

@unit 8 | Applications of Integration | 积分的应用
- average value of a function | 函数的平均值 | (1/(b − a))∫ₐᵇ f(x)dx | 函数在区间上的平均高度。 | The average temperature over 12 hours is the average value of T(t). | 2
- area between curves | 曲线间面积 | The integral of (top function − bottom function) over an interval | 上方函数减下方函数在区间上的积分。 | Find where the curves intersect to set the limits for area between curves. | 2
- volume by disc method | 圆盘法求体积 | Volume of revolution computed as π∫[R(x)]²dx | 绕轴旋转体的体积，截面为圆盘。 | Rotating y = √x about the x-axis uses the disc method. | 3
  vs: washer method
- washer method | 垫圈法 | Volume of revolution with a hole: π∫(R² − r²)dx | 截面为圆环（垫圈）的旋转体体积。 | Rotating the region between two curves uses the washer method. | 3
  vs: volume by disc method
- volume with known cross sections | 已知截面求体积 | Volume computed by integrating the area of cross sections perpendicular to an axis | 把垂直于某轴的截面面积积分得到体积。 | Squares built on the region give a volume with known cross sections. | 3

@q cab-u1-001 | UNDERSTAND | CONCEPT | MCQ | 1 | 2 | limit; continuity
? f(2) is undefined, but f(x) approaches 5 as x approaches 2 from both sides. Which is true?
=* The limit of f(x) as x → 2 is 5, and f is not continuous at 2. :: Correct — the limit exists, but continuity requires f(2) to exist and equal 5.
= The limit does not exist because f(2) is undefined. :: Limits depend on nearby values, not on f(2).
= f is continuous at 2 because the limit exists. :: Continuity also requires f(2) = 5.
= f has a vertical asymptote at x = 2. :: Outputs approach 5, not infinity.
! A limit describes nearby behavior. Continuity requires three conditions: f(a) exists, the limit exists, and they are equal.
!zh 极限描述附近的行为。连续需要三个条件：f(a) 存在、极限存在、二者相等。
@q cab-u2-001 | UNDERSTAND | CONCEPT | MCQ | 2 | 2 | differentiability; continuity
? Which statement is always true?
=* If f is differentiable at x = a, then f is continuous at x = a. :: Correct — differentiability implies continuity.
= If f is continuous at x = a, then f is differentiable at x = a. :: |x| at 0 is a counterexample.
= If f′(a) = 0, then f has a maximum at a. :: f(x) = x³ is a counterexample.
= If f is continuous, f′ exists everywhere. :: Corners and cusps break differentiability.
! Differentiable ⇒ continuous, but not the reverse.
!zh 可导 ⇒ 连续，反之不成立。
@q cab-u4-001 | APPLY | APPLICATION | SCENARIO | 4 | 3 | particle motion
? At t = 2, a particle has velocity −3 m/s and acceleration −1 m/s². At that instant, the particle is
=* speeding up, because velocity and acceleration have the same sign. :: Correct — same signs mean speed increases.
= slowing down, because acceleration is negative. :: A negative acceleration slows the particle only if velocity is positive.
= at rest. :: Velocity is −3, not 0.
= changing direction. :: Direction changes require velocity to change sign.
! Speed increases when v and a have the same sign, and decreases when they have opposite signs.
!zh v 与 a 同号时速率增大，异号时速率减小。
@q cab-u6-001 | APPLY | APPLICATION | GRAPH | 6 | 2 | definite integral; Riemann sum
? For an increasing function on [a, b], a left Riemann sum will
vis: riemann
=* underestimate the definite integral. :: Correct — left endpoints are the lowest values on each subinterval.
= overestimate the definite integral. :: That is the right Riemann sum for an increasing function.
= equal the definite integral exactly. :: Only in special cases.
= equal the average value of the function. :: Riemann sums approximate the integral, not the average value.
! For increasing f, left endpoints give rectangles below the curve (underestimate); right endpoints give an overestimate.
!zh 函数递增时，左黎曼和偏小，右黎曼和偏大。

@pair continuity-vs-differentiability | continuity | differentiability
! Continuity means no breaks; differentiability means a well-defined tangent slope. Differentiable ⇒ continuous, but continuous does not imply differentiable.
!zh 连续表示图像不断开；可导表示切线斜率确定。可导必连续，连续不一定可导。
d: Graph test :: No holes, jumps or asymptotes :: Also no corners, cusps or vertical tangents
d: Implies the other? :: No :: Yes
s: A :: f(x) = |x| at x = 0. :: Continuous but has a corner, so only continuous.
s: B :: f(x) = x² at x = 1, where the tangent slope is 2. :: Has a well-defined derivative.
s: A :: A graph with a sharp cusp at x = 3 but no gap. :: Cusp breaks differentiability only.
s: B :: The limit of the difference quotient exists at x = a. :: That is the definition of differentiability.
@pair critical-vs-inflection | critical point | inflection point
! A critical point is where f′ = 0 or undefined (possible max/min); an inflection point is where f″ changes sign (concavity changes).
!zh 临界点：f′ = 0 或不存在（可能的极值点）；拐点：f″ 变号（凹凸性改变）。
s: A :: f′(4) = 0 and f′ changes from + to −. :: First-derivative information.
s: B :: The graph switches from concave up to concave down at x = 1. :: Concavity change.
s: B :: f″ changes from positive to negative at x = 2. :: Second-derivative sign change.
s: A :: f′ does not exist at a corner. :: Undefined derivative ⇒ critical point.
