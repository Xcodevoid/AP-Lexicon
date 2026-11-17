# AP Physics C (Mechanics + E&M) — master IDs 06-xxx plus research expansion. Pending teacher review.
@subject ap-physics-c | AP Physics C | AP 物理 C（力学与电磁学） | Physics C | indigo | 10
@desc Calculus-based mechanics and electricity & magnetism.
@framework Units 1–7 follow AP Physics C: Mechanics; units 8–13 follow AP Physics C: Electricity and Magnetism.

@unit 1 | Kinematics | 运动学
- position vector | 位置矢量 | A vector locating a point relative to an origin | 从原点指向物体位置的矢量 r(t)。 | The velocity is the time derivative of the position vector. | 2 | #06-001
- instantaneous velocity | 瞬时速度 | The derivative of position with respect to time, v = dx/dt | 位置对时间的导数。 | If x(t) = 3t², the instantaneous velocity at t = 2 is 12 m/s. | 2 | #06-002
- instantaneous acceleration | 瞬时加速度 | The derivative of velocity with respect to time, a = dv/dt | 速度对时间的导数，也是位置的二阶导数。 | a(t) = d²x/dt² gives acceleration from position. | 2 | #06-003
- vector components | 矢量分量 | Projections of a vector along coordinate axes | 矢量在坐标轴上的投影，例如 vₓ = v cosθ。 | Resolve the launch velocity into vector components before solving. | 1 | #06-004

@unit 2 | Force and Translational Dynamics | 力与平动动力学
- Newton's second law | 牛顿第二定律 | Net force equals the time rate of change of momentum, F = dp/dt (= ma for constant mass) | 合力等于动量对时间的变化率；质量不变时 F = ma。 | For variable mass systems, use F = dp/dt. | 2 | #06-005
- drag force | 阻力（拖曳力） | A resistive force from a fluid that depends on speed, such as F = −bv | 流体对运动物体的阻力，常建模为与速度成正比，导致终端速度。 | With drag F = −bv, a falling object approaches terminal velocity mg/b. | 3
- terminal velocity | 终端速度 | The constant speed reached when drag balances gravity | 阻力与重力平衡时达到的恒定速度。 | A skydiver reaches terminal velocity when net force is zero. | 2

@unit 3 | Work, Energy, and Power | 功、能量与功率
- work-energy theorem | 动能定理 | Net work equals the change in kinetic energy | 合外力做功等于动能变化，W = ∫F·dx = ΔK。 | Integrate a variable force over displacement to find work and ΔK. | 2 | #06-006
- conservative force | 保守力 | A force whose work is path-independent, F = −dU/dx | 做功与路径无关的力，可以定义势能，F = −dU/dx。 | Gravity and spring forces are conservative forces. | 3 | #06-007
- potential energy curve | 势能曲线 | A graph of U(x) whose slope gives force and whose minima are stable equilibria | U(x) 图像，斜率的负值为力，极小值为稳定平衡点。 | At a minimum of the potential energy curve, the force is zero. | 3

@unit 4 | Linear Momentum | 线动量
- center of mass | 质心 | The mass-weighted average position, x_cm = ∫x dm / M | 质量加权平均位置，连续物体用积分计算。 | Find the center of mass of a rod with nonuniform density by integrating. | 3
- impulse | 冲量 | The integral of force over time, J = ∫F dt = Δp | 力对时间的积分，等于动量变化。 | The area under a force-time graph gives impulse. | 2

@unit 5 | Torque and Rotational Dynamics | 力矩与转动动力学
- moment of inertia | 转动惯量 | The integral of mass times squared distance from the axis, I = ∫r² dm | 质量与到转轴距离平方乘积的积分，描述转动惯性。 | Calculate the moment of inertia of a uniform rod about its end using I = ∫r² dm. | 3 | #06-008
- angular acceleration | 角加速度 | The rate of change of angular velocity, α = dω/dt | 角速度对时间的导数。 | A constant net torque produces constant angular acceleration. | 2 | #06-009
- parallel axis theorem | 平行轴定理 | I = I_cm + Md², for an axis parallel to one through the center of mass | 绕平行于质心轴的转轴的转动惯量。 | Use the parallel axis theorem to find I of a rod about its end. | 3
- torque (vector) | 力矩（矢量） | The cross product of position and force, τ = r × F | 位置矢量与力的叉乘，方向由右手定则确定。 | The right-hand rule gives the direction of the torque vector. | 3

@unit 6 | Energy and Momentum of Rotating Systems | 转动系统的能量与动量
- angular momentum (vector) | 角动量（矢量） | L = r × p for a particle, or Iω for a rigid body | 质点 L = r × p，刚体 L = Iω。 | A particle moving in a straight line can have angular momentum about a point. | 3
- rolling motion | 滚动 | Combined translation and rotation; without slipping, v_cm = Rω | 平动加转动；纯滚动时 v_cm = Rω。 | A rolling sphere's kinetic energy is split between translation and rotation. | 3

@unit 7 | Oscillations | 振动
- simple harmonic motion | 简谐运动 | Motion satisfying d²x/dt² = −ω²x, with sinusoidal solutions | 满足 d²x/dt² = −ω²x 的运动，解为正弦函数。 | x(t) = A cos(ωt + φ) solves the SHM differential equation. | 3
- physical pendulum | 复摆 | An extended rigid body oscillating about a pivot, T = 2π√(I/mgd) | 绕固定点摆动的刚体。 | A meter stick pivoted at one end is a physical pendulum. | 3

@unit 8 | Electric Charges, Fields, and Gauss's Law | 电荷、电场与高斯定律
- electric field | 电场 | The electric force per unit positive test charge, E = F/q | 单位正试探电荷所受的电力，方向为正电荷受力方向。 | Electric field lines point away from positive charges. | 2 | #06-010
- electric flux | 电通量 | The surface integral of the electric field through an area, Φ = ∫E·dA | 电场穿过某一面积的“通量”。 | The electric flux through a closed surface depends only on the enclosed charge. | 3
- Gauss's law | 高斯定律 | The electric flux through a closed surface equals the enclosed charge divided by ε₀ | ∮E·dA = Q_enc/ε₀，适合高对称性电荷分布求电场。 | Gauss's law shows the field inside a charged conducting sphere is zero. | 3 | #06-012
- conductor | 导体 | A material in which charges move freely | 电荷可以自由移动的材料；静电平衡时导体内部电场为零。 | Excess charge on a conductor resides on its surface. | 2

@unit 9 | Electric Potential | 电势
- electric potential | 电势 | Electric potential energy per unit charge, V = U/q | 单位电荷的电势能，标量；E = −dV/dx。 | A positive charge moves from high to low electric potential. | 2 | #06-011
- equipotential surface | 等势面 | A surface on which the electric potential is the same everywhere | 电势处处相等的面，电场线与等势面垂直。 | No work is done moving a charge along an equipotential surface. | 3

@unit 10 | Conductors and Capacitors | 导体与电容器
- capacitance | 电容 | The charge stored per unit potential difference, C = Q/V | 电容器储存电荷的能力，平行板电容 C = ε₀A/d。 | Inserting a dielectric increases capacitance. | 2 | #06-013
- dielectric | 电介质 | An insulating material that reduces the electric field inside a capacitor | 放入电容器中能减弱内部电场、增大电容的绝缘材料。 | A dielectric with κ = 3 triples the capacitance. | 3

@unit 11 | Electric Circuits | 电路
- current | 电流 | The rate of flow of charge, I = dQ/dt | 单位时间内通过导体截面的电荷量。 | A current of 2 A moves 2 coulombs per second. | 1
- resistance | 电阻 | Opposition to electric current, R = V/I | 导体对电流的阻碍作用，R = ρL/A。 | A longer wire of the same material has greater resistance. | 1 | #06-014
- Kirchhoff's loop rule | 基尔霍夫回路定律 | The sum of potential changes around any closed loop is zero | 闭合回路中电势变化的代数和为零，体现能量守恒。 | Apply Kirchhoff's loop rule to find the current in each branch. | 3 | #06-015
  vs: Kirchhoff's junction rule
- Kirchhoff's junction rule | 基尔霍夫节点定律 | The total current into a junction equals the total current out | 流入节点的电流之和等于流出的电流之和，体现电荷守恒。 | At a junction, 3 A in must equal 3 A out. | 2
  vs: Kirchhoff's loop rule
- RC circuit | RC 电路 | A circuit with a resistor and capacitor whose charge changes exponentially with time constant τ = RC | 含电阻与电容的电路，充放电按指数变化，时间常数 τ = RC。 | After one time constant, a charging capacitor reaches about 63% of its final charge. | 3

@unit 12 | Magnetic Fields and Electromagnetism | 磁场与电磁学
- magnetic force | 磁场力 | The force on a moving charge in a magnetic field, F = qv × B | 运动电荷在磁场中受的力（洛伦兹力），与速度垂直，不做功。 | A charged particle moving perpendicular to B travels in a circle. | 3
- Biot-Savart law | 毕奥-萨伐尔定律 | A law giving the magnetic field produced by a small current element | 计算电流元产生磁场的定律。 | Use the Biot-Savart law to find B at the center of a current loop. | 3
- Ampère's law | 安培环路定理 | The line integral of B around a closed loop equals μ₀ times the enclosed current | ∮B·dl = μ₀I_enc，适用于高对称电流分布。 | Ampère's law gives the field inside a long solenoid. | 3

@unit 13 | Electromagnetic Induction | 电磁感应
- magnetic flux | 磁通量 | The surface integral of the magnetic field through an area, Φ_B = ∫B·dA | 磁场穿过某一面积的通量。 | Rotating a loop in a magnetic field changes the magnetic flux through it. | 2 | #06-016
- Faraday's law | 法拉第电磁感应定律 | The induced emf equals the negative rate of change of magnetic flux | 感应电动势 ε = −dΦ_B/dt。 | Moving a magnet into a coil induces an emf by Faraday's law. | 3 | #06-017
- Lenz's law | 楞次定律 | The induced current flows in a direction that opposes the change in flux | 感应电流的方向总是阻碍引起它的磁通量变化（负号的含义）。 | Lenz's law explains why a magnet falls slowly through a copper tube. | 3
- inductance | 电感 | The property relating a changing current to an induced emf, ε = −L dI/dt | 电流变化引起感应电动势的性质。 | An inductor resists sudden changes in current. | 3 | #06-018

@q phc-u8-001 | UNDERSTAND | CONCEPT | MCQ | 8 | 3 | Gauss's law
? A closed surface encloses no net charge. What must be true?
=* The net electric flux through the surface is zero. :: Correct — Gauss's law: Φ = Q_enc/ε₀ = 0.
= The electric field is zero everywhere on the surface. :: Field lines can enter and exit; only the NET flux is zero.
= No electric field lines cross the surface. :: Lines may cross in and out.
= The surface must be a conductor. :: Gauss's law applies to any closed surface.
! Zero enclosed charge means zero net flux, but the field on the surface can be nonzero.
!zh 包围净电荷为零 ⇒ 净通量为零，但面上电场不一定为零。
@q phc-u13-001 | APPLY | APPLICATION | SCENARIO | 13 | 3 | Lenz's law; Faraday's law
? A magnet's north pole is pushed toward a loop. The induced current in the loop will
=* create a magnetic field opposing the increasing flux, so the loop's face toward the magnet acts like a north pole. :: Correct — the loop repels the approaching north pole.
= create a field that strengthens the increasing flux. :: That would violate Lenz's law and energy conservation.
= be zero because the magnet is not inside the loop. :: Changing flux induces current regardless.
= flow only after the magnet stops. :: Induction requires changing flux.
! Lenz's law: induced current opposes the change in flux that produces it.
!zh 楞次定律：感应电流的磁场总是阻碍引起它的磁通量变化。

@pair loop-vs-junction | Kirchhoff's loop rule | Kirchhoff's junction rule
! The loop rule (energy conservation) sums voltages around a loop to zero; the junction rule (charge conservation) balances currents at a node.
!zh 回路定律（能量守恒）：回路电压之和为零；节点定律（电荷守恒）：节点电流进出相等。
s: A :: ε − IR₁ − IR₂ = 0 around a single loop. :: Potential changes sum to zero.
s: B :: I₁ = I₂ + I₃ where three wires meet. :: Currents balance at a node.
s: B :: Based on conservation of charge. :: Junction rule.
s: A :: Based on conservation of energy. :: Loop rule.
