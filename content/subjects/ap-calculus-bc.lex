# AP Calculus BC — terms from the uploaded BC_Vocabs notes (organized by unit as in the notes),
# merged with master IDs 08-xxx. Units 1–8 list BC-relevant highlights; full AB vocabulary lives in AP Calculus AB.
@subject ap-calculus-bc | AP Calculus BC | AP 微积分 BC | Calc BC | sky | 8
@desc Everything in AB plus advanced integration, parametric/polar/vector functions and infinite series.
@framework Unit titles follow the AP Calculus BC course framework (10 units). Units 1–8 share content with Calculus AB.

@unit 1 | Limits and Continuity | 极限与连续
- discontinuity | 间断点 | A point where a function is not continuous: removable (hole), jump, or infinite | 函数不连续的点，分为可去间断（空洞）、跳跃间断和无穷间断。 | f(x) = 1/x has an infinite discontinuity at x = 0. | 2
- continuous | 连续的 | A function with no breaks, jumps or holes, where lim f(x) as x → a equals f(a) | 没有断开、跳跃或空洞，满足极限等于函数值。 | Polynomials are continuous for all real x. | 1

@unit 2 | Differentiation: Definition and Fundamental Properties | 导数：定义与基本性质
- differentiable | 可导的 | Having a derivative at every point in question; no corners, cusps or vertical tangents | 每一点都有导数，没有尖角、尖点或竖直切线。 | A function differentiable on (a, b) is also continuous there. | 2
- instantaneous rate of change | 瞬时变化率 | The rate of change at a single instant, given by the derivative | 某一时刻的变化率，即导数。 | The instantaneous rate of change of volume at t = 3 is V′(3). | 2
  vs: average rate of change

@unit 3 | Differentiation: Composite, Implicit, and Inverse Functions | 复合、隐函数与反函数求导
- inverse function derivative | 反函数求导 | If g is the inverse of f, then g′(x) = 1/f′(g(x)) | 反函数在某点的导数等于原函数在对应点导数的倒数。 | If f(2) = 5 and f′(2) = 4, then (f⁻¹)′(5) = 1/4. | 3

@unit 4 | Contextual Applications of Differentiation | 导数的实际应用
- L'Hôpital's rule | 洛必达法则 | Using derivatives to evaluate indeterminate limits like 0/0 or ∞/∞ | 用导数计算 0/0 或 ∞/∞ 型未定式极限：分子分母分别求导。 | L'Hôpital's rule gives the limit of ln(x)/x as x → ∞ equal to 0. | 3
- indeterminate form | 未定式 | A limit expression such as 0/0, ∞/∞, 0·∞ or 1^∞ whose value cannot be determined directly | 不能直接判断值的极限形式，需要化简或用洛必达法则。 | 0/0 is an indeterminate form, not equal to 1 or 0. | 3
  mis: 0/0 equals 0 or 1 — it is indeterminate; the limit could be any value.

@unit 5 | Analytical Applications of Differentiation | 导数的分析应用
- mean value theorem | 中值定理 | Instantaneous rate equals average rate at some point in an open interval, if f is continuous and differentiable | 存在一点的导数等于区间平均变化率（需满足连续、可导条件）。 | The MVT guarantees c in (0, 4) with f′(c) = (f(4) − f(0))/4. | 3
- point of inflection | 拐点 | A point where the concavity and the sign of f″ change | 凹凸性以及 f″ 符号改变的点。 | The point of inflection occurs where f″ switches sign. | 2

@unit 6 | Integration and Accumulation of Change | 积分与变化的累积
- integration by parts | 分部积分法 | ∫u dv = uv − ∫v du, an integration technique based on the product rule | 由乘积求导法则推出的积分方法，适合多项式乘指数、对数等。 | Integrate x eˣ using integration by parts with u = x. | 3 | #08-001
- partial fractions | 部分分式分解 | Decomposing a rational expression into simpler fractions to integrate | 把有理分式拆成简单分式之和再积分。 | 1/((x − 1)(x + 2)) can be split into partial fractions A/(x − 1) + B/(x + 2). | 3 | #08-002
- improper integral | 反常积分 | An integral with an infinite limit or an unbounded integrand, evaluated as a limit | 积分区间无限或被积函数无界的积分，用极限计算，可能收敛或发散。 | The improper integral ∫₁^∞ 1/x² dx converges to 1. | 3 | #08-003
  rel: convergence
- indefinite integral | 不定积分 | The family of all antiderivatives of a function, written with + C | 函数所有原函数的集合，结果要加常数 C。 | The indefinite integral of cos x is sin x + C. | 1
  vs: definite integral
- definite integral | 定积分 | The accumulation of change, or signed area under a curve, over an interval | 区间上的累积变化量（有向面积），结果是一个数。 | ∫₀³ v(t) dt gives the displacement from t = 0 to 3. | 2
  vs: indefinite integral

@unit 7 | Differential Equations | 微分方程
- Euler's method | 欧拉法 | A numerical step-by-step method that uses tangent lines to approximate solutions to differential equations | 用切线逐步近似微分方程解的数值方法：y_new = y + (dy/dx)·Δx。 | Euler's method with step size 0.5 approximates y(1) in two steps. | 3 | #08-007
- logistic growth | 逻辑斯谛增长 | Bounded growth modeled by dP/dt = kP(1 − P/K), approaching carrying capacity K | 有上限的增长模型，P 趋近于承载量 K，P = K/2 时增长最快。 | A logistic population grows fastest when P is half the carrying capacity. | 3
  vis: logistic
- slope field | 斜率场 | A graphical grid of short tangent segments representing dy/dx | 用短切线段表示 dy/dx 的图形网格。 | Sketch a solution curve that follows the slope field through (0, 1). | 2

@unit 8 | Applications of Integration | 积分的应用
- arc length | 弧长 | The length along a curve, L = ∫ √(1 + (dy/dx)²) dx | 曲线的长度。参数方程形式为 ∫ √((dx/dt)² + (dy/dt)²) dt。 | Find the arc length of y = x^(3/2) from x = 0 to 4. | 3 | #08-006
- volumes of revolution | 旋转体体积 | Volumes of solids formed by rotating a region about an axis, using disk or washer methods | 区域绕轴旋转形成的立体体积，用圆盘法或垫圈法计算。 | Rotating the region under y = x² about the x-axis uses the disk method. | 3

@unit 9 | Parametric Equations, Polar Coordinates, and Vector-Valued Functions | 参数方程、极坐标与向量值函数
- parametric equations | 参数方程 | Defining x(t) and y(t) in terms of a third parameter t | 用第三个参数 t 分别表示 x 和 y。dy/dx = (dy/dt)/(dx/dt)。 | For a particle with x = t² and y = 3t, the slope is dy/dx = 3/(2t). | 3 | #08-004
- polar coordinates | 极坐标 | Representing points by a radius r and an angle θ, written (r, θ) | 用距离 r 和角 θ 表示点。极坐标下面积 A = ½∫r² dθ。 | The area inside r = 2sin θ uses ½∫r² dθ. | 3 | #08-005
- vector-valued function | 向量值函数 | A function assigning a vector ⟨x(t), y(t)⟩ to each time t | 为每个时刻 t 指定一个向量 ⟨x(t), y(t)⟩ 的函数，常表示位置。 | The velocity vector is the derivative of the position vector-valued function. | 3
- speed (vector) | 速率（向量形式） | The magnitude of the velocity vector, √((dx/dt)² + (dy/dt)²) | 速度向量的模长。 | A particle with velocity ⟨3, 4⟩ has speed 5. | 3

@unit 10 | Infinite Sequences and Series | 无穷数列与级数
- sequence | 数列 | An ordered list of numbers | 按顺序排列的一列数。 | The sequence 1, 1/2, 1/3, … converges to 0. | 1 | #08-008
  vs: series
- series | 级数 | The sum of the terms of a sequence | 数列各项之和。数列收敛不代表级数收敛。 | The harmonic series 1 + 1/2 + 1/3 + … diverges even though its terms approach 0. | 2 | #08-009
  mis: If the terms approach 0, the series converges — the harmonic series is a counterexample.
  vs: sequence
- convergence | 收敛 | Approaching a finite limit; an infinite series converges if its partial sums approach a finite value | 趋于有限的极限。级数收敛指部分和趋于有限值。 | A geometric series converges when |r| < 1. | 2 | #08-010
  vs: divergence
- divergence | 发散 | Failing to approach a finite limit, by growing without bound or oscillating | 不趋于有限极限（无限增大或振荡）。 | The series Σ n diverges because its partial sums grow without bound. | 2
  vs: convergence
- nth term test | 第 n 项检验法 | If the terms of a series do not approach 0, the series diverges | 若通项不趋于 0，则级数发散。注意它只能判定发散，不能判定收敛。 | Since n/(n + 1) → 1, the nth term test shows the series diverges. | 2
  mis: If the terms go to 0, the nth term test proves convergence — it is inconclusive in that case.
- geometric series | 几何级数（等比级数） | A series with a constant ratio r between terms; it converges to a/(1 − r) if |r| < 1 | 公比为 r 的级数，|r| < 1 时收敛于 a/(1 − r)。 | 1 + 1/2 + 1/4 + … converges to 2. | 2
- p-series | p 级数 | A series of the form Σ 1/nᵖ, convergent if p > 1 | 形如 Σ1/nᵖ 的级数，p > 1 收敛，p ≤ 1 发散。 | Σ 1/n² is a convergent p-series. | 2
- integral test | 积分判别法 | A series and the improper integral of its positive, decreasing term function either both converge or both diverge | 正项递减级数与对应反常积分同敛散。 | Use the integral test with ∫₁^∞ 1/x dx to show the harmonic series diverges. | 3
- comparison test | 比较判别法 | Comparing a series with a known convergent or divergent series | 与已知敛散性的级数比较（直接比较或极限比较）。 | Since 1/(n² + 1) < 1/n², the comparison test shows convergence. | 3
- ratio test | 比值判别法 | A test using the limit of |aₙ₊₁/aₙ|: converges if less than 1, diverges if greater than 1 | 后项与前项比值的极限 < 1 收敛，> 1 发散，= 1 无法判断。 | The ratio test is useful for series with factorials. | 3 | #08-012
- alternating series test | 交错级数判别法 | An alternating series converges if its terms decrease in absolute value and approach 0 | 交错级数若各项绝对值单调递减且趋于 0，则收敛。 | The alternating harmonic series converges by the alternating series test. | 3 | #08-013
- absolute convergence | 绝对收敛 | Convergence of the series of absolute values | 各项取绝对值后的级数也收敛。绝对收敛一定收敛。 | Σ (−1)ⁿ/n² converges absolutely. | 3 | #08-011
  vs: conditional convergence
- conditional convergence | 条件收敛 | A series that converges, but whose series of absolute values diverges | 级数收敛但绝对值级数发散。 | The alternating harmonic series converges conditionally. | 3
  vs: absolute convergence
- power series | 幂级数 | A series of the form Σ cₙ(x − a)ⁿ centered at a | 以 a 为中心的、各项为 (x − a) 的幂的级数。 | A power series may converge only on an interval of x-values. | 3 | #08-014
- radius of convergence | 收敛半径 | The distance from the center within which a power series converges | 幂级数在中心两侧收敛的范围半径；端点需单独检验。 | If the radius of convergence is 2, check the endpoints separately. | 3 | #08-017
- interval of convergence | 收敛区间 | The set of x-values for which a power series converges | 幂级数收敛的所有 x 组成的区间，包括端点检验结果。 | The interval of convergence of Σ xⁿ/n is [−1, 1). | 3
- Taylor series | 泰勒级数 | A power series built from a function's derivatives at x = c | 以 x = c 处各阶导数构造的幂级数：Σ f⁽ⁿ⁾(c)(x − c)ⁿ/n!。 | The Taylor series for eˣ at 0 is 1 + x + x²/2! + …. | 3 | #08-015
  vs: Maclaurin series
- Maclaurin series | 麦克劳林级数 | A Taylor series centered at x = 0 | 以 0 为中心的泰勒级数。 | The Maclaurin series for sin x is x − x³/3! + x⁵/5! − …. | 3 | #08-016
  vs: Taylor series
- Taylor polynomial | 泰勒多项式 | A finite partial sum of a Taylor series used to approximate a function | 泰勒级数的有限项部分和，用来近似函数。 | A third-degree Taylor polynomial approximates cos(0.1). | 3
- Lagrange error bound | 拉格朗日余项界 | A bound on the maximum error of a Taylor polynomial approximation | 估计泰勒多项式近似误差上界：|R| ≤ M|x − c|ⁿ⁺¹/(n + 1)!。 | Use the Lagrange error bound to show the approximation is accurate to 0.001. | 3 | #08-018
- alternating series error bound | 交错级数误差界 | For a convergent alternating series, the error is at most the first omitted term | 交错级数截断误差不超过第一个被省略项的绝对值。 | Stopping after 4 terms gives an error less than the 5th term. | 3

@q cbc-u10-001 | UNDERSTAND | CONCEPT | MCQ | 10 | 3 | nth term test; series
? The terms of a series approach 0. What does the nth term test conclude?
= The series converges. :: The harmonic series has terms → 0 but diverges.
=* Nothing — the test is inconclusive. :: Correct — the test can only show divergence.
= The series diverges. :: Divergence follows only if terms do NOT approach 0.
= The series converges absolutely. :: The test says nothing about absolute convergence.
! The nth term test: if lim aₙ ≠ 0, the series diverges. If lim aₙ = 0, use another test.
!zh 第 n 项检验：若 lim aₙ ≠ 0，级数发散；若 lim aₙ = 0，无法判断，需用其他方法。
@q cbc-u10-002 | APPLY | APPLICATION | MCQ | 10 | 3 | absolute convergence; conditional convergence
? Σ (−1)ⁿ/n converges, but Σ 1/n diverges. The series Σ (−1)ⁿ/n is
= absolutely convergent. :: Its absolute values form the divergent harmonic series.
=* conditionally convergent. :: Correct — it converges, but not absolutely.
= divergent. :: It converges by the alternating series test.
= a geometric series. :: There is no constant ratio.
! Conditional convergence: the series converges but the series of absolute values diverges.
!zh 条件收敛：原级数收敛，但绝对值级数发散。
@q cbc-u9-001 | APPLY | APPLICATION | MCQ | 9 | 3 | parametric equations
? For x(t) = t² and y(t) = t³, what is dy/dx at t = 2?
= 12 :: That is dy/dt alone.
=* 3 :: Correct — (3t²)/(2t) = 3t/2 = 3 at t = 2.
= 4 :: That is dx/dt alone.
= 1/3 :: That is dx/dy.
! For parametric curves, dy/dx = (dy/dt)/(dx/dt).
!zh 参数方程求导：dy/dx = (dy/dt)/(dx/dt)。

@pair sequence-vs-series | sequence | series
! A sequence is a LIST of terms; a series is the SUM of those terms. A sequence can converge to 0 while its series diverges.
!zh 数列是一列数；级数是这些数的和。数列趋于 0 时，级数仍可能发散。
s: A :: 1, 1/2, 1/4, 1/8, … :: A list of terms.
s: B :: 1 + 1/2 + 1/4 + 1/8 + … = 2 :: A sum of terms.
s: B :: The partial sums Sₙ approach 5. :: Partial sums describe a series.
s: A :: aₙ = 3n − 1 gives the nth term. :: A formula for terms in a list.
@pair taylor-vs-maclaurin | Taylor series | Maclaurin series
! A Maclaurin series is simply a Taylor series centered at 0.
!zh 麦克劳林级数就是以 0 为中心的泰勒级数。
s: A :: A series for ln x centered at x = 1. :: Center ≠ 0.
s: B :: eˣ = 1 + x + x²/2! + … :: Centered at 0.
s: A :: Powers of (x − 2) appear in the series. :: Centered at 2.
s: B :: The series uses f⁽ⁿ⁾(0). :: Derivatives at 0.
