# AP Computer Science Principles — master IDs 14-xxx plus research expansion. Pending teacher review.
@subject ap-computer-science-principles | AP Computer Science Principles | AP 计算机科学原理 | CSP | slate | 15
@desc The big ideas of computing: creative development, data, algorithms, networks and impact.
@framework Units follow the five Big Ideas of the AP Computer Science Principles course framework.

@unit 1 | Creative Development | 创造性开发
- iterative development | 迭代开发 | A process of repeatedly designing, testing and refining a program | 反复设计、测试和改进程序的开发过程。 | The team used iterative development, releasing a prototype and improving it after feedback. | 2
- program documentation | 程序文档 | Written descriptions of how a program or code segment works | 描述程序如何运行的说明，如注释。 | Comments are a form of program documentation. | 1
- logic error | 逻辑错误 | A mistake that causes a program to behave incorrectly though it runs | 程序能运行但结果错误的错误。 | Using > instead of >= is a logic error. | 1
  vs: syntax error
- syntax error | 语法错误 | A mistake in the rules of a programming language that prevents the program from running | 违反语言语法规则、导致程序无法运行的错误。 | A missing parenthesis causes a syntax error. | 1
  vs: logic error

@unit 2 | Data | 数据
- bit | 比特 | A binary digit, either 0 or 1 | 二进制位，计算机中最小的数据单位。 | Each bit can represent two values. | 1 | #14-004
- byte | 字节 | A group of eight bits | 8 个比特组成一个字节。 | One byte can represent 256 different values. | 1 | #14-005
- binary representation | 二进制表示 | Encoding information using only two symbols, 0 and 1 | 只用 0 和 1 表示信息。 | The number 5 in binary representation is 101. | 2 | #14-003
- overflow error | 溢出错误 | An error when a value is too large for the fixed number of bits | 数值超出固定位数所能表示的范围时产生的错误。 | Adding 1 to the largest 8-bit value causes an overflow error. | 2
- lossless compression | 无损压缩 | Reducing data size so the original can be exactly reconstructed | 压缩后可以完全恢复原始数据。 | ZIP files use lossless compression. | 2 | #14-006
  vs: lossy compression
- lossy compression | 有损压缩 | Reducing data size by permanently discarding some information | 压缩时永久丢弃部分信息，文件更小但无法完全还原。 | JPEG images use lossy compression. | 2 | #14-007
  vs: lossless compression
- metadata | 元数据 | Data that describes other data | 描述数据的数据，如照片的拍摄时间和位置。 | A photo's metadata may reveal where it was taken. | 1 | #14-020
- abstraction | 抽象 | Reducing complexity by hiding details and focusing on what is relevant | 隐藏细节、只关注重要部分以管理复杂性。 | A procedure is an abstraction because users call it without knowing its code. | 2 | #14-002

@unit 3 | Algorithms and Programming | 算法与编程
- algorithm | 算法 | A finite set of instructions that accomplishes a task | 完成任务的有限步骤，由顺序、选择和迭代组成。 | A recipe is an everyday algorithm. | 1 | #14-001
- sequencing | 顺序结构 | Executing steps in order | 按顺序执行步骤。 | Sequencing means the second instruction runs after the first. | 1
- selection | 选择结构 | Choosing which steps to execute based on a condition | 根据条件决定执行哪些步骤。 | An IF statement implements selection. | 1
- Boolean expression | 布尔表达式 | An expression that evaluates to true or false | 值为真或假的表达式。 | score ≥ 90 is a Boolean expression. | 1 | #14-014
- list | 列表 | An ordered collection of elements | 有序的元素集合，AP CSP 伪代码中索引从 1 开始。 | In AP pseudocode, the first element of a list has index 1. | 2 | #14-015
  mis: List indexes always start at 0 — in AP CSP pseudocode, they start at 1.
- procedure | 过程 | A named group of instructions that may have parameters and return values | 有名字、可带参数和返回值的一组指令。 | A procedure named average(list) returns the mean. | 2 | #14-016
- simulation | 模拟 | A program that models a real-world process | 用程序模拟现实过程，可节约成本但会简化现实。 | A traffic simulation tests new signal timing safely. | 2 | #14-017
- heuristic | 启发式算法 | An approach that finds a good-enough solution when an exact one is impractical | 在精确解不可行时找到足够好的近似解的方法。 | Route-planning apps use heuristics to find fast routes quickly. | 3
- undecidable problem | 不可判定问题 | A problem for which no algorithm can always give a correct yes-or-no answer | 不存在算法能对所有输入都给出正确答案的问题。 | The halting problem is an undecidable problem. | 3
- reasonable time | 合理时间 | Algorithms whose running time grows polynomially with input size | 运行时间随输入规模多项式增长的算法。 | Linear search runs in reasonable time. | 3

@unit 4 | Computer Systems and Networks | 计算机系统与网络
- packet | 数据包 | A small unit of data sent across a network | 网络传输的小数据单元，可能走不同路径、乱序到达。 | Packets may arrive out of order and be reassembled. | 1 | #14-008
- protocol | 协议 | An agreed-upon set of rules for communication | 通信双方约定的规则，如 TCP/IP、HTTP。 | TCP is a protocol that ensures reliable delivery. | 2 | #14-009
- bandwidth | 带宽 | The maximum amount of data that can be sent in a fixed time | 单位时间内可传输的最大数据量。 | Streaming video needs high bandwidth. | 1 | #14-010
  vs: latency
- latency | 延迟 | The time it takes for data to travel from sender to receiver | 数据从发送方到接收方所需的时间。 | Online gamers want low latency. | 1 | #14-011
  vs: bandwidth
- fault tolerance | 容错性 | The ability of a system to keep working when some parts fail | 部分组件失效时系统仍能工作的能力，互联网通过冗余路径实现。 | Redundant routing gives the internet fault tolerance. | 2
- parallel computing | 并行计算 | Breaking a task into parts that run at the same time | 把任务分成多个部分同时运行。 | Parallel computing speeds up image rendering. | 2 | #14-012
- distributed computing | 分布式计算 | Using multiple devices connected over a network to run a program | 利用网络中多台设备运行程序。 | Volunteer projects use distributed computing to analyze data. | 2 | #14-013

@unit 5 | Impact of Computing | 计算的影响
- digital divide | 数字鸿沟 | Unequal access to computing devices and the internet | 不同人群在使用电脑和网络方面的不平等。 | Rural areas without broadband face the digital divide. | 1
- computing bias | 计算偏差 | Unfair outcomes from biased data or design in computing systems | 由于数据或设计偏差导致计算系统产生不公平结果。 | A hiring algorithm trained on biased data can show computing bias. | 2 | #14-018
- crowdsourcing | 众包 | Obtaining input or services from a large group of people online | 通过网络从大量人群获取信息或服务。 | Citizen-science apps use crowdsourcing to classify images. | 1
- encryption | 加密 | Encoding data to prevent unauthorized access | 把数据编码以防止未授权的访问。 | HTTPS uses encryption to protect passwords. | 2 | #14-019
- public key encryption | 公钥加密 | Encryption using a public key to encrypt and a private key to decrypt | 使用公钥加密、私钥解密的方法。 | Anyone can encrypt a message with your public key, but only you can decrypt it. | 3
  vs: symmetric encryption
- symmetric encryption | 对称加密 | Encryption that uses the same key to encrypt and decrypt | 加密和解密使用同一个密钥。 | A shared password for a ZIP file is symmetric encryption. | 3
  vs: public key encryption
- phishing | 网络钓鱼 | A technique that tricks users into revealing personal information | 诱骗用户泄露个人信息的手段。 | An email asking you to "verify your password" may be phishing. | 1
- multifactor authentication | 多因素认证 | Requiring two or more kinds of evidence to log in | 需要两种或以上证据登录（如密码 + 验证码）。 | A code sent to your phone adds multifactor authentication. | 1

@q csp-u2-001 | UNDERSTAND | CONCEPT | SCENARIO | 2 | 2 | lossless compression; lossy compression
? A hospital must compress medical scans so that every detail can be perfectly restored later. Which should it use?
=* Lossless compression :: Correct — the original data can be exactly reconstructed.
= Lossy compression :: Lossy compression permanently discards some data.
= Encryption :: Encryption protects data but does not compress it.
= Metadata :: Metadata describes data; it is not compression.
! Lossless compression allows exact reconstruction; lossy compression trades fidelity for smaller size.
!zh 无损压缩可完全还原；有损压缩以牺牲部分信息换取更小体积。
@q csp-u4-001 | UNDERSTAND | CONCEPT | MCQ | 4 | 2 | bandwidth; latency
? A video call has a noticeable delay before each person hears the other, even though the picture is sharp. Which is the most likely issue?
= Low bandwidth :: Low bandwidth would reduce picture quality.
=* High latency :: Correct — latency is the delay in data delivery.
= Lossless compression :: Compression type does not cause delays like this.
= Fault tolerance :: Fault tolerance keeps systems running despite failures.
! Bandwidth is how much data per second; latency is how long data takes to arrive.
!zh 带宽是每秒能传多少数据；延迟是数据到达需要多长时间。

@pair bandwidth-vs-latency | bandwidth | latency
! Bandwidth = how MUCH data can flow per second (pipe width); latency = how LONG data takes to arrive (travel time).
!zh 带宽：每秒能传输多少数据（管道粗细）；延迟：数据到达需要多久（传输时间）。
s: A :: A 4K movie streams smoothly without pixelation. :: Large data volume per second.
s: B :: A game shows a 200 ms ping. :: Delay time.
s: B :: Satellite internet has a lag before each response. :: Long travel time.
s: A :: Upgrading from 50 Mbps to 500 Mbps. :: Data rate.
@pair lossless-vs-lossy | lossless compression | lossy compression
! Lossless compression can be undone exactly; lossy compression permanently throws away some information for a smaller file.
!zh 无损压缩可完全还原；有损压缩永久丢弃部分信息以获得更小文件。
s: A :: Compressing a text document into a ZIP file. :: Every character must be restored.
s: B :: Saving a photo as a lower-quality JPEG. :: Some detail is discarded.
s: B :: Streaming music at a reduced bit rate. :: Fidelity is traded for size.
s: A :: Archiving source code. :: Must be exact.
