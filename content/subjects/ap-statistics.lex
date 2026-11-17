# AP Statistics — master IDs 12-xxx plus research expansion. Pending teacher review.
@subject ap-statistics | AP Statistics | AP 统计学 | Stats | teal | 13
@desc Exploring data, collecting data, probability and statistical inference.
@framework Unit titles follow the AP Statistics course framework (9 units).

@unit 1 | Exploring One-Variable Data | 单变量数据探索
- standard deviation | 标准差 | A measure of the typical distance of data values from the mean | 数据值与平均值之间的典型距离，对离群值敏感。 | A larger standard deviation means test scores are more spread out. | 2 | #12-010
- interquartile range | 四分位距 | The difference between the third and first quartiles, Q3 − Q1 | 中间 50% 数据的范围，对离群值不敏感。 | The IQR is a resistant measure of spread. | 2 | #12-011
- outlier | 离群值 | An observation that falls unusually far from the rest of the data | 远离其他数据的观测值，常用 1.5×IQR 规则判断。 | A value above Q3 + 1.5·IQR is considered an outlier. | 1 | #12-012
- median | 中位数 | The middle value of ordered data | 排序后位于中间的数，对离群值不敏感。 | In a right-skewed distribution, the mean is usually greater than the median. | 1
  vs: mean
- mean | 平均数 | The sum of values divided by the number of values | 所有数据之和除以个数，受离群值影响大。 | One very high income can pull the mean far above the median. | 1
  vs: median
- skewed distribution | 偏态分布 | A distribution with a longer tail on one side | 一侧尾巴较长的分布，右偏时尾巴在右侧。 | Household income is typically right-skewed. | 2
- z-score | z 分数（标准分数） | The number of standard deviations a value is from the mean | 数据值偏离平均值多少个标准差：z = (x − μ)/σ。 | A z-score of 2 means the value is two standard deviations above the mean. | 2
- normal distribution | 正态分布 | A symmetric, bell-shaped distribution described by its mean and standard deviation | 对称的钟形分布；约 68%、95%、99.7% 的数据分别落在均值 ±1、2、3 个标准差内。 | About 95% of values in a normal distribution lie within 2 SDs of the mean. | 2
  vis: normal

@unit 2 | Exploring Two-Variable Data | 双变量数据探索
- correlation coefficient | 相关系数 | A number r between −1 and 1 measuring the strength and direction of a linear relationship | 衡量线性关系强度和方向的数，介于 −1 与 1 之间。 | r = −0.9 indicates a strong negative linear association. | 2 | #12-013
  mis: A strong correlation proves causation — correlation alone does not establish cause and effect.
  vis: scatter
- regression line | 回归直线 | A line modeling the predicted response from an explanatory variable | 用解释变量预测响应变量的直线（最小二乘回归线）。 | The regression line predicts a score of 82 for 5 hours of study. | 2 | #12-014
- residual | 残差 | Observed value minus predicted value | 实际值减去预测值，残差为正表示模型低估了。 | A positive residual means the actual value was above the regression line. | 2 | #12-015
- coefficient of determination | 决定系数 | r², the proportion of variation in the response explained by the linear model | 响应变量变化中能被线性模型解释的比例。 | r² = 0.81 means 81% of the variation in y is explained by x. | 3
- extrapolation | 外推 | Using a model to predict far outside the range of the data | 在数据范围之外用模型进行预测，结果往往不可靠。 | Predicting a child's height at age 40 from ages 2–10 is risky extrapolation. | 2

@unit 3 | Collecting Data | 数据收集
- population | 总体 | The entire group about which we want information | 研究想要得出结论的全体对象。 | All registered voters in a state form the population for a poll. | 1 | #12-001
  vs: sample
- sample | 样本 | A subset of the population that is actually studied | 实际被研究的总体的一部分。 | A sample of 1,000 voters is used to estimate the population proportion. | 1 | #12-002
  vs: population
- sampling bias | 抽样偏差 | Systematic error caused by the way a sample is selected | 由于抽样方式导致样本系统性地偏离总体。 | An online-only survey may suffer from sampling bias. | 2 | #12-005
- simple random sample | 简单随机样本 | A sample in which every group of size n has an equal chance of being selected | 每个容量为 n 的组被选中的概率相同。 | Drawing names from a hat gives a simple random sample. | 2
- stratified random sample | 分层随机样本 | A sample formed by dividing the population into similar groups and randomly sampling within each | 先按相似特征分层，再在每层内随机抽样。 | Sampling randomly within each grade level is a stratified random sample. | 3
  vs: cluster sample
- cluster sample | 整群抽样 | A sample formed by randomly selecting whole groups | 随机选择若干整群，并调查群内所有个体。 | Randomly choosing five homerooms and surveying every student is a cluster sample. | 3
  vs: stratified random sample
- observational study | 观察性研究 | A study that observes individuals without imposing treatments | 只观察、不施加处理的研究，不能得出因果结论。 | An observational study can show an association but not causation. | 2 | #12-007
  vs: experiment
- experiment | 实验 | A study that deliberately imposes treatments to measure their effects | 有意施加处理以观察效果的研究，随机分配后可推断因果。 | A randomized experiment can show that a drug causes lower blood pressure. | 2 | #12-008
  vs: observational study
- randomization | 随机化 | Using chance to select samples or assign treatments | 用机会决定抽样或处理分配。 | Randomization balances unknown confounding variables across groups. | 2 | #12-006
- confounding | 混杂 | When the effects of two variables on a response cannot be separated | 两个变量对结果的影响无法区分。 | Confounding makes it impossible to tell whether diet or exercise caused weight loss. | 3 | #12-009
- blinding | 盲法 | Keeping subjects (and/or evaluators) unaware of which treatment was received | 使受试者（和/或评估者）不知道接受了哪种处理，双盲两者都不知道。 | A double-blind design prevents expectations from biasing results. | 2

@unit 4 | Probability, Random Variables, and Probability Distributions | 概率、随机变量与概率分布
- probability distribution | 概率分布 | A description of the possible values of a random variable and their probabilities | 随机变量所有可能取值及其概率。 | The probabilities in a probability distribution must sum to 1. | 2 | #12-016
- independent events | 独立事件 | Events for which one occurring does not change the probability of the other | 一个事件发生不影响另一个事件发生的概率：P(A∩B) = P(A)P(B)。 | Two coin flips are independent events. | 2
  vs: mutually exclusive
- mutually exclusive | 互斥 | Events that cannot occur at the same time | 不能同时发生的事件，P(A∩B) = 0。 | Rolling a 2 and rolling a 5 on one die are mutually exclusive. | 2
  vs: independent events
- expected value | 期望值 | The long-run average value of a random variable | 随机变量的长期平均值 E(X) = Σx·P(x)。 | A lottery ticket's expected value is usually less than its price. | 2
- binomial distribution | 二项分布 | The distribution of the number of successes in n independent trials with the same success probability | n 次独立重复试验中成功次数的分布。 | The number of heads in 10 coin flips follows a binomial distribution. | 3

@unit 5 | Sampling Distributions | 抽样分布
- parameter | 总体参数 | A number describing a population | 描述总体的数（通常未知），如 μ、p。 | The true proportion of all voters who support a law is a parameter. | 2 | #12-003
  vs: statistic
- statistic | 样本统计量 | A number calculated from sample data | 由样本计算的数，如 x̄、p̂，用来估计参数。 | The sample mean x̄ is a statistic used to estimate μ. | 2 | #12-004
  vs: parameter
- sampling distribution | 抽样分布 | The distribution of a statistic over all possible samples of the same size | 同样大小的所有可能样本的统计量分布。 | The sampling distribution of x̄ becomes approximately normal as n increases. | 3 | #12-017
- central limit theorem | 中心极限定理 | For large n, the sampling distribution of the sample mean is approximately normal | 样本量足够大时，样本均值的抽样分布近似正态，无论总体形状如何。 | Because n = 50, the central limit theorem lets us use a normal model for x̄. | 3

@unit 6 | Inference for Categorical Data: Proportions | 分类数据推断：比例
- confidence interval | 置信区间 | An interval of plausible values for a parameter, produced by a method with a stated capture rate | 由某种方法得到的参数可能取值区间；95% 指该方法在重复抽样中约 95% 的区间包含真实参数。 | A 95% confidence interval for p is (0.42, 0.50). | 3 | #12-018
  mis: There is a 95% probability the parameter is in this interval — the 95% describes the method's long-run capture rate.
- margin of error | 误差范围 | The half-width of a confidence interval | 置信区间宽度的一半，样本越大误差范围越小。 | Increasing the sample size reduces the margin of error. | 2
- null hypothesis | 原假设 | The claim of no effect or no difference used as the baseline in a significance test | 显著性检验中假定“无效应/无差异”的基准假设 H₀。 | The null hypothesis states that the new drug has no effect. | 2 | #12-020
  vs: alternative hypothesis
- alternative hypothesis | 备择假设 | The claim the test seeks evidence for | 研究者希望找到证据支持的假设 Hₐ。 | Hₐ: p > 0.5 claims a majority supports the policy. | 2
  vs: null hypothesis
- p-value | p 值 | The probability, assuming H₀ is true, of a result at least as extreme as the one observed | 假设原假设成立时，得到至少与观测结果一样极端的概率。p 值小说明证据反对 H₀。 | A p-value of 0.01 gives strong evidence against the null hypothesis. | 3 | #12-019
  mis: The p-value is the probability that H₀ is true — it assumes H₀ is true.
- statistical significance | 统计显著性 | When the p-value is below the significance level α, giving convincing evidence against H₀ | p 值小于显著性水平 α，有充分证据拒绝原假设。 | With α = 0.05 and p = 0.03, the result is statistically significant. | 3 | #12-022
- type I error | 第一类错误 | Rejecting a null hypothesis that is actually true | 原假设为真却被拒绝（“误报”）。 | Convicting an innocent defendant is like a type I error. | 3 | #12-021
  vs: type II error
- type II error | 第二类错误 | Failing to reject a null hypothesis that is actually false | 原假设为假却没有被拒绝（“漏报”）。 | Missing a real disease in a screening test is a type II error. | 3
  vs: type I error
- power | 检验功效 | The probability of correctly rejecting a false null hypothesis | 正确拒绝错误原假设的概率，= 1 − P(第二类错误)。 | Increasing sample size increases the power of a test. | 3

@unit 7 | Inference for Quantitative Data: Means | 数值数据推断：均值
- t-distribution | t 分布 | A distribution used for inference about means when σ is unknown | 总体标准差未知时用于均值推断的分布，自由度越大越接近正态。 | With n = 15, use a t-distribution with 14 degrees of freedom. | 3
- standard error | 标准误 | The estimated standard deviation of a statistic's sampling distribution | 统计量抽样分布标准差的估计值。 | The standard error of x̄ is s/√n. | 3

@unit 8 | Inference for Categorical Data: Chi-Square | 分类数据推断：卡方
- chi-square test | 卡方检验 | A test comparing observed counts with expected counts for categorical data | 比较分类数据观测频数与期望频数的检验。 | A chi-square test checks whether a die is fair. | 3

@unit 9 | Inference for Quantitative Data: Slopes | 数值数据推断：斜率
- slope of the regression line | 回归直线的斜率 | The predicted change in y for each one-unit increase in x | x 每增加 1 单位时 y 的预测变化量。 | A slope of 3.2 means each extra hour predicts 3.2 more points. | 2

@q stats-u3-001 | UNDERSTAND | CONCEPT | SCENARIO | 3 | 2 | observational study; experiment
? Researchers compare test scores of students who choose to drink coffee with those who don't. They find coffee drinkers score higher. What can be concluded?
= Coffee causes higher test scores. :: Students chose their group, so confounding is possible.
=* There is an association, but causation cannot be concluded because this is an observational study. :: Correct — no treatment was imposed.
= The study is an experiment because it compares groups. :: Comparing groups does not make it an experiment.
= There is no association. :: The data do show an association.
! Only randomized experiments support cause-and-effect conclusions.
!zh 只有随机化实验才能得出因果结论；观察性研究只能显示关联。
@q stats-u6-001 | UNDERSTAND | CONCEPT | MCQ | 6 | 3 | p-value
? A test gives a p-value of 0.04. Which interpretation is correct?
= There is a 4% chance the null hypothesis is true. :: The p-value assumes H₀ is true.
=* If H₀ were true, there is a 4% chance of getting a result at least this extreme. :: Correct.
= There is a 96% chance the alternative hypothesis is true. :: P-values do not give probabilities of hypotheses.
= The result is not significant at α = 0.05. :: 0.04 < 0.05, so it is significant.
! A p-value is a conditional probability computed assuming the null hypothesis is true.
!zh p 值是在假设原假设成立的条件下计算的概率。

@pair parameter-vs-statistic | parameter | statistic
! A parameter describes a POPULATION (usually unknown); a statistic describes a SAMPLE and is used to estimate the parameter. (Population–Parameter, Sample–Statistic.)
!zh 参数描述总体（通常未知）；统计量描述样本，用来估计参数。
s: A :: The true mean height of all US adults. :: Population value.
s: B :: The mean height of 200 surveyed adults is 168 cm. :: Computed from a sample.
s: B :: p̂ = 0.62 from a poll. :: Sample proportion.
s: A :: μ, the population mean. :: Greek letters usually denote parameters.
@pair type1-vs-type2 | type I error | type II error
! Type I: rejecting a TRUE H₀ (false alarm). Type II: failing to reject a FALSE H₀ (missed detection).
!zh 第一类错误：拒绝了真的 H₀（误报）；第二类错误：没有拒绝假的 H₀（漏报）。
s: A :: A fire alarm rings when there is no fire. :: False alarm.
s: B :: A test fails to detect a drug that really works. :: Missed real effect.
s: B :: A spam filter lets a spam email through. :: H₀ "not spam" was false but not rejected.
s: A :: Concluding a fair coin is biased. :: Rejecting a true H₀.
@pair correlation-vs-causation | correlation coefficient | causation
! Correlation measures how strongly two variables move together; causation means one variable produces a change in the other. Only well-designed experiments establish causation.
!zh 相关衡量两个变量共同变化的程度；因果表示一个变量导致另一个变化。只有设计良好的实验才能确立因果。
s: A :: Ice cream sales and drownings both rise in summer. :: Association with a lurking variable (heat).
s: B :: A randomized experiment shows a vaccine reduces infection. :: Experiment supports causation.
s: A :: r = 0.7 between hours of TV and snack consumption. :: A measure of association.
s: B :: Randomly assigned fertilizer increases plant growth. :: Controlled experiment.
