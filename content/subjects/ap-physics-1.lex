# AP Physics 1 — terms organized from the uploaded AP_Physics_1_Vocabularies notes (8 units),
# merged with master-spreadsheet IDs (05-xxx). Definitions condensed/paraphrased; pending teacher review.
@subject ap-physics-1 | AP Physics 1 | AP 物理 1 | Physics 1 | indigo | 4
@desc Algebra-based mechanics: motion, forces, energy, momentum, rotation, oscillations and fluids.
@framework Unit titles follow the AP Physics 1 course framework (8 units, including Fluids) as listed in the uploaded notes.

@unit 1 | Kinematics | 运动学
@topic 1.1 | Describing Motion | 描述运动 | Distinguish scalars and vectors; Interpret motion graphs
- scalar | 标量 | A quantity with magnitude only, such as distance, speed or mass | 只有大小、没有方向的物理量，如路程、速率、质量。 | Speed is a scalar, so it cannot be negative. | 1
  vs: vector
- vector | 矢量 | A quantity with both magnitude and direction, such as displacement or velocity | 既有大小又有方向的物理量，如位移、速度、力。计算时要考虑方向（正负号或分量）。 | Velocity is a vector, so a car moving west at 20 m/s has velocity −20 m/s if east is positive. | 1
  vs: scalar
  vis: vector
- displacement | 位移 | The straight-line change in position from initial to final point, including direction | 从初位置指向末位置的有向线段（矢量）。与路程（总路径长度）不同。 | A runner who completes one lap of a 400 m track has zero displacement. | 1 | #05-001
  mis: Displacement equals distance traveled — distance is the total path length; displacement is net change in position.
  rel: distance; velocity
  vs: distance
- distance | 路程 | The total length of the path traveled, regardless of direction | 物体运动轨迹的总长度，是标量，不会为负。 | Walking 3 m east then 3 m west gives a distance of 6 m. | 1
  vs: displacement
- velocity | 速度（矢量） | The rate of change of position; displacement per unit time with direction | 位移随时间的变化率，有方向。平均速度 = 总位移/时间；瞬时速度是某一时刻的速度。 | The slope of a position-time graph gives the object's velocity. | 1 | #05-002
  mis: Velocity and speed are the same — velocity includes direction.
  rel: displacement; acceleration
  vs: speed
- speed | 速率 | How fast an object moves; distance per unit time without direction | 单位时间内通过的路程，是标量。 | A car on a circular track can have constant speed but changing velocity. | 1
  vs: velocity
- acceleration | 加速度 | The rate of change of velocity | 速度随时间的变化率（矢量）。加速度不只表示“加速”，减速或改变方向也都有加速度。 | An object moving in a circle at constant speed is accelerating because its direction changes. | 2 | #05-003
  mis: Acceleration means speeding up — slowing down and changing direction are also acceleration.
  mis: Zero velocity means zero acceleration — a ball at the top of its flight has zero velocity but acceleration g downward.
  rel: velocity; net force
  vis: motion-graph vt
- position-time graph | 位置-时间图 | A graph of position versus time whose slope gives velocity | 以位置为纵轴、时间为横轴的图像，斜率表示速度；割线斜率为平均速度，切线斜率为瞬时速度。 | A curved position-time graph indicates changing velocity. | 2
  rel: velocity
  vs: velocity-time graph
  vis: motion-graph xt
- velocity-time graph | 速度-时间图 | A graph of velocity versus time; slope gives acceleration and area gives displacement | 速度-时间图像中，斜率表示加速度，图线与时间轴围成的面积表示位移。 | The area under a velocity-time graph between 0 and 4 s gives the displacement. | 2
  vs: position-time graph
  vis: motion-graph vt
@topic 1.2 | Free Fall and Projectiles | 自由落体与抛体 | Apply constant-acceleration equations; Treat horizontal and vertical motion independently
- free fall | 自由落体 | Motion under the influence of gravity alone, with acceleration of about 9.8 m/s² downward near Earth | 只受重力作用的运动，加速度约 9.8 m/s²，方向竖直向下，与物体质量无关（忽略空气阻力）。 | Ignoring air resistance, a heavy and a light ball dropped together hit the ground at the same time. | 1
  mis: Heavier objects fall faster — without air resistance, all objects have the same free-fall acceleration.
  rel: acceleration; projectile motion
- projectile motion | 抛体运动 | Motion of an object launched into the air, with independent horizontal and vertical components | 被抛出的物体的运动：水平方向匀速，竖直方向匀加速（g），两个方向相互独立，仅通过时间联系。 | A ball thrown horizontally lands at the same time as one dropped from the same height. | 2
  rel: free fall; vector components
- reference frame | 参考系 | The perspective or coordinate system from which motion is measured | 描述运动时所选的参照物或坐标系，相对速度取决于参考系。 | A passenger walking forward on a train has a different velocity relative to the ground than relative to the train. | 2
  rel: relative velocity

@unit 2 | Force and Translational Dynamics | 力与平动动力学
@topic 2.1 | Newton's Laws | 牛顿运动定律 | Apply Newton's three laws; Draw free-body diagrams
- force | 力 | A push or pull resulting from an interaction between objects | 物体之间相互作用产生的推或拉，可以改变物体的运动状态。包括接触力和非接触力（如重力）。 | Gravity is a noncontact force that acts on a falling apple. | 1
  rel: net force; Newton's second law
- inertia | 惯性 | An object's resistance to changes in its state of motion | 物体保持原有运动状态的性质，质量越大惯性越大（牛顿第一定律）。 | Passengers lurch forward when a bus brakes suddenly because of inertia. | 1 | #05-005
  mis: Moving objects need a force to keep moving — without net force, they keep moving at constant velocity.
  rel: Newton's first law; mass
- net force | 合力 | The vector sum of all forces acting on an object | 作用在物体上所有力的矢量和。合力决定加速度：ΣF = ma。 | If the net force on a box is zero, it moves at constant velocity or stays at rest. | 1 | #05-004
  rel: Newton's second law; free-body diagram
- Newton's second law | 牛顿第二定律 | The acceleration of an object equals the net force divided by its mass (ΣF = ma) | 物体的加速度与合力成正比，与质量成反比，方向与合力相同。 | Doubling the net force on a cart doubles its acceleration. | 2
  rel: net force; inertia
- Newton's third law | 牛顿第三定律 | For every force one object exerts on another, the second exerts an equal and opposite force on the first | 作用力与反作用力大小相等、方向相反，作用在两个不同物体上，因此不会相互抵消。 | When you push on a wall, the wall pushes back on you with an equal force. | 2
  mis: Action-reaction forces cancel out — they act on different objects, so they never cancel.
  rel: interaction pair
  vs: balanced forces
- free-body diagram | 受力分析图 | A diagram showing all external forces on one object as labeled arrows | 只画出研究对象所受的所有外力（用带标签的箭头），是解决动力学问题的第一步。 | A free-body diagram of a hanging lamp shows tension up and gravity down. | 1 | #05-006
  rel: net force; normal force
  vis: free-body
@topic 2.2 | Types of Forces | 常见的力 | Analyze friction, tension, normal and spring forces; Apply circular motion
- normal force | 法向力（支持力） | The perpendicular support force exerted by a surface on an object | 接触面对物体施加的垂直于接触面的支持力。它不一定等于重力（如斜面或电梯加速时）。 | On an incline, the normal force is less than the object's weight. | 1 | #05-008
  mis: The normal force always equals weight — it depends on other forces and acceleration.
  vs: weight
- friction | 摩擦力 | A contact force that opposes sliding or attempted sliding between surfaces | 阻碍两接触面相对滑动或相对滑动趋势的力。静摩擦阻止开始滑动，动摩擦作用于滑动过程中。 | Static friction lets your shoes push off the ground without slipping. | 1 | #05-007
  rel: static friction; kinetic friction; normal force
- static friction | 静摩擦力 | Friction that prevents surfaces from starting to slide relative to each other | 物体相对静止但有滑动趋势时的摩擦力，大小可变，最大值为 μsN。 | A box stays still on a ramp because static friction balances the component of gravity along the ramp. | 2
  vs: kinetic friction
- kinetic friction | 动摩擦力 | Friction acting between surfaces that are sliding relative to each other | 物体相对滑动时的摩擦力，大小约为 μkN，通常小于最大静摩擦力。 | Once a heavy crate starts sliding, kinetic friction is usually smaller than the static friction needed to start it. | 2
  vs: static friction
- tension | 张力 | The pulling force transmitted through a rope, string or cable | 绳子、缆索被拉紧时沿绳方向传递的拉力。 | The tension in a rope holding a stationary 10 kg mass is about 98 N. | 1
- weight | 重力（重量） | The gravitational force on an object, equal to mass times g | 物体所受的重力 W = mg，会随重力场强度变化；质量则不变。 | An astronaut's weight is smaller on the Moon, but her mass is unchanged. | 1
  vs: mass; normal force
- mass | 质量 | The amount of matter in an object and a measure of its inertia | 物体所含物质的多少，也是惯性大小的量度，不随位置改变。 | A 2 kg object has the same mass on Earth and on Mars. | 1
  vs: weight
- centripetal force | 向心力 | The net inward force that keeps an object moving in a circle | 使物体做圆周运动的指向圆心的合力。它不是一种新的力，而是由张力、重力、摩擦力等提供。 | For a car rounding a flat curve, static friction provides the centripetal force. | 2
  mis: Centripetal force is an extra force to add to a free-body diagram — it is the net of the real forces.
  rel: centripetal acceleration; uniform circular motion
- centripetal acceleration | 向心加速度 | Acceleration directed toward the center of a circular path, a = v²/r | 指向圆心的加速度，大小为 v²/r，只改变速度方向不改变大小。 | Doubling a car's speed on the same curve quadruples its centripetal acceleration. | 2 | #05-009
  rel: centripetal force
- universal gravitation | 万有引力 | Every mass attracts every other mass with a force proportional to the product of masses and inversely proportional to distance squared | F = Gm1m2/r²。距离加倍，引力变为原来的四分之一。 | If the distance between two planets doubles, the gravitational force becomes one-fourth as large. | 2
  rel: weight
- Hooke's law | 胡克定律 | The force exerted by a spring is proportional to its displacement from equilibrium, F = −kx | 弹簧弹力与形变量成正比，方向与形变方向相反（负号）。 | A spring with k = 200 N/m stretched 0.1 m exerts a 20 N restoring force. | 2
  rel: restoring force; elastic potential energy
  vis: spring

@unit 3 | Work, Energy, and Power | 功、能量与功率
@topic 3.1 | Energy and Work | 能量与功 | Apply the work-energy theorem; Use conservation of energy
- work | 功 | Energy transferred to or from a system by a force acting through a displacement, W = Fd cosθ | 力使物体沿力的方向发生位移时所传递的能量。力与位移垂直时不做功。 | A person carrying a box horizontally at constant velocity does no work on it against gravity. | 2 | #05-013
  mis: Holding a heavy object still is work — no displacement means no work in the physics sense.
  rel: work-energy theorem; kinetic energy
- kinetic energy | 动能 | The energy of motion, KE = ½mv² | 物体由于运动而具有的能量。速度加倍，动能变为四倍。 | Doubling a car's speed quadruples its kinetic energy and stopping distance. | 1 | #05-014
  rel: work-energy theorem; momentum
  vs: momentum
- potential energy | 势能 | Energy stored in a system because of the positions or configuration of its parts | 由于系统内物体的相对位置或形状而储存的能量，如重力势能和弹性势能。 | A stretched rubber band stores elastic potential energy. | 1 | #05-015
  rel: gravitational potential energy; elastic potential energy
- gravitational potential energy | 重力势能 | Energy stored due to height in a gravitational field, U = mgh | 由于物体在重力场中的高度而具有的能量，属于物体-地球系统。 | A roller coaster converts gravitational potential energy into kinetic energy as it descends. | 1
- elastic potential energy | 弹性势能 | Energy stored in a stretched or compressed elastic object, U = ½kx² | 弹性物体（如弹簧）发生形变时储存的能量。 | Compressing a spring twice as far stores four times as much elastic potential energy. | 2
  rel: Hooke's law
- work-energy theorem | 动能定理 | The net work done on an object equals its change in kinetic energy | 合外力做的功等于动能的变化：ΣW = ΔKE。正功使速度增大，负功使速度减小。 | Friction does negative work on a sliding puck, reducing its kinetic energy. | 2
  rel: work; kinetic energy
- conservative force | 保守力 | A force whose work depends only on initial and final positions, not the path | 做功只与始末位置有关、与路径无关的力，如重力和弹力。只有保守力做功时机械能守恒。 | Gravity is conservative, so a ball's speed at a given height is the same on the way up and down (no air resistance). | 3
  vs: nonconservative force
- nonconservative force | 非保守力 | A force, such as friction, whose work depends on the path and converts mechanical energy into other forms | 做功与路径有关的力（如摩擦力），会把机械能转化为内能等其他形式。 | Friction converts some of a sled's mechanical energy into thermal energy. | 3
  vs: conservative force
- mechanical energy | 机械能 | The sum of kinetic and potential energy in a system | 动能与势能之和。只有保守力做功时，机械能守恒。 | A pendulum's mechanical energy stays constant if air resistance is negligible. | 2
- power | 功率 | The rate at which work is done or energy is transferred, P = W/t | 做功或能量传递的快慢，单位瓦特（W）。 | Two students climb the same stairs; the one who climbs faster develops more power. | 1 | #05-016
  vs: energy
- energy bar chart | 能量条形图 | A diagram (LOL diagram) showing how energy is stored and transferred in a system before and after a process | 用条形表示初态和末态各种能量的大小以及系统外的能量传递，帮助直观理解能量守恒。 | An energy bar chart for a falling ball shows gravitational energy decreasing and kinetic energy increasing. | 2

@unit 4 | Linear Momentum | 线动量
@topic 4.1 | Momentum and Collisions | 动量与碰撞 | Apply impulse-momentum theorem; Analyze elastic and inelastic collisions
- momentum | 动量 | The product of an object's mass and velocity, p = mv | 质量与速度的乘积，是矢量，方向与速度相同。 | A slow truck can have more momentum than a fast bicycle because of its large mass. | 1 | #05-010
  mis: Momentum and kinetic energy are the same — momentum is a vector (mv); kinetic energy is a scalar (½mv²).
  rel: impulse; conservation of momentum
  vs: kinetic energy
- impulse | 冲量 | The product of average force and time interval, equal to the change in momentum, J = FΔt = Δp | 力在一段时间内的累积效果，等于动量的变化。延长作用时间可以减小冲击力。 | Airbags reduce injury by increasing the time of impact, which lowers the average force for the same impulse. | 2 | #05-011
  rel: momentum; force-time graph
- conservation of momentum | 动量守恒 | In a system with no net external force, total momentum stays constant | 系统不受外力或所受合外力为零时，总动量保持不变。 | When two skaters push apart from rest, their total momentum remains zero. | 2 | #05-012
  rel: elastic collision; inelastic collision
- elastic collision | 弹性碰撞 | A collision in which both momentum and kinetic energy are conserved | 碰撞前后动量和动能都守恒。 | Collisions between ideal billiard balls are approximately elastic. | 2
  vs: inelastic collision
- inelastic collision | 非弹性碰撞 | A collision in which momentum is conserved but kinetic energy is not | 动量守恒但动能不守恒，部分动能转化为内能、声音或形变。物体粘在一起时为完全非弹性碰撞。 | Two cars that crumple and lock together undergo a perfectly inelastic collision. | 2
  mis: Momentum is lost in inelastic collisions — momentum is conserved; kinetic energy is not.
  vs: elastic collision
- center of mass | 质心 | The average position of a system's mass, which moves as if all external forces acted there | 系统质量分布的平均位置。没有合外力时，质心以恒定速度运动。 | After an exploding firework, the center of mass continues along the original parabola. | 2

@unit 5 | Torque and Rotational Dynamics | 力矩与转动动力学
@topic 5.1 | Rotational Motion and Torque | 转动与力矩 | Describe rotation with θ, ω and α; Calculate torque and apply Στ = Iα
- angular displacement | 角位移 | The change in an object's angular position, measured in radians | 物体转过的角度（弧度），Δθ = θf − θi。 | A wheel that turns half a revolution has an angular displacement of π radians. | 2
  rel: angular velocity
- angular velocity | 角速度 | The rate of change of angular displacement, ω = Δθ/Δt | 角位移随时间的变化率，刚体上各点角速度相同。 | All points on a spinning record have the same angular velocity but different linear speeds. | 2
  rel: angular acceleration
- angular acceleration | 角加速度 | The rate of change of angular velocity, α = Δω/Δt | 角速度随时间的变化率，由合力矩引起。 | A net torque on a wheel produces angular acceleration. | 2
- torque | 力矩 | The rotational effect of a force, τ = rF sinθ | 力使物体转动的效果，等于力与力臂的乘积。 | Pushing a door far from the hinges produces more torque than pushing near them. | 2 | #05-018
  mis: Torque only depends on force — it also depends on the lever arm and angle.
  rel: lever arm; rotational inertia
  vs: force
- lever arm | 力臂 | The perpendicular distance from the axis of rotation to the line of action of a force | 转轴到力的作用线的垂直距离，力臂越长，力矩越大。 | A longer wrench increases the lever arm and makes loosening a bolt easier. | 2
- rotational inertia | 转动惯量 | An object's resistance to changes in rotational motion, depending on mass and its distribution | 物体抵抗转动状态改变的性质，取决于质量以及质量相对转轴的分布。质量离轴越远，转动惯量越大。 | A hoop rolls down a ramp more slowly than a solid disk of the same mass because it has more rotational inertia. | 3 | #05-017
  rel: torque; angular momentum
  vs: inertia
- rotational equilibrium | 转动平衡 | A state in which the net torque on an object is zero | 合力矩为零，角速度保持不变。静态平衡要求合力和合力矩都为零。 | A balanced seesaw is in rotational equilibrium. | 2
  rel: torque

@unit 6 | Energy and Momentum of Rotating Systems | 转动系统的能量与动量
@topic 6.1 | Rotational Energy and Angular Momentum | 转动能与角动量 | Apply conservation of angular momentum; Combine translational and rotational kinetic energy
- rotational kinetic energy | 转动动能 | The kinetic energy of a rotating object, KE = ½Iω² | 物体转动所具有的动能。滚动物体的总动能 = 平动动能 + 转动动能。 | Part of a rolling ball's energy is rotational kinetic energy. | 3
  rel: rotational inertia
- angular momentum | 角动量 | The rotational analog of linear momentum, L = Iω | 转动惯量与角速度的乘积。不受外力矩时角动量守恒。 | A figure skater spins faster when she pulls in her arms, conserving angular momentum. | 3 | #05-019
  rel: conservation of angular momentum; rotational inertia
- conservation of angular momentum | 角动量守恒 | If no net external torque acts on a system, its angular momentum remains constant | 系统所受合外力矩为零时，总角动量不变：I减小则ω增大。 | A diver tucks to reduce rotational inertia and increase angular velocity. | 3
- rolling without slipping | 纯滚动 | Rolling motion in which the contact point does not slide, so v = rω | 物体滚动时接触点不打滑，线速度与角速度满足 v = rω。 | A bicycle wheel rolling without slipping moves forward 2πr per revolution. | 3

@unit 7 | Oscillations | 振动
@topic 7.1 | Simple Harmonic Motion | 简谐运动 | Describe SHM with amplitude, period and frequency
- simple harmonic motion | 简谐运动 | Periodic motion in which the restoring force is proportional to displacement and points toward equilibrium | 回复力与位移成正比且指向平衡位置的周期性运动，例如弹簧振子和小角度单摆。 | A mass on a spring undergoes simple harmonic motion when friction is negligible. | 2 | #05-020
  rel: restoring force; period; amplitude
  vis: spring
- restoring force | 回复力 | A force that always acts to return an object toward its equilibrium position | 始终指向平衡位置、使物体回到平衡位置的力，方向与位移相反。 | Gravity provides the restoring force for a pendulum. | 2
- amplitude | 振幅 | The maximum displacement from equilibrium | 偏离平衡位置的最大距离。简谐运动的周期与振幅无关。 | Pulling a spring farther increases amplitude but not the period. | 1
  vs: period
- period | 周期 | The time to complete one full cycle of motion | 完成一次全振动所需的时间 T。弹簧振子 T = 2π√(m/k)，单摆 T = 2π√(L/g)。 | Increasing a pendulum's length increases its period. | 1
  mis: A heavier pendulum bob swings more slowly — a pendulum's period does not depend on mass.
  vs: frequency
- frequency | 频率 | The number of cycles per second, f = 1/T, measured in hertz | 单位时间内完成的全振动次数，单位赫兹（Hz），与周期互为倒数。 | A pendulum completing 2 swings per second has a frequency of 2 Hz. | 1
  vs: period
- pendulum | 单摆 | A mass on a string that swings back and forth; approximately SHM for small angles | 小角度摆动时近似做简谐运动，周期只取决于摆长和 g。 | Pendulum clocks rely on a pendulum's nearly constant period. | 1
  vis: pendulum

@unit 8 | Fluids | 流体
@topic 8.1 | Pressure and Buoyancy | 压强与浮力 | Apply pressure and buoyancy relationships; Use the continuity equation and Bernoulli's principle
- density | 密度 | Mass per unit volume, ρ = m/V | 单位体积的质量。物体密度小于液体密度时会漂浮。 | Ice floats because its density is less than that of liquid water. | 1
- pressure | 压强 | Perpendicular force per unit area, P = F/A | 垂直作用在单位面积上的力，单位帕斯卡（Pa）。 | Snowshoes reduce pressure by spreading weight over a larger area. | 1
  vs: force
- hydrostatic pressure | 静水压强 | Pressure in a fluid at rest that increases with depth, P = P₀ + ρgh | 静止液体中的压强随深度增加而增大，与容器形状无关。 | Divers feel greater pressure on their ears as they descend. | 2
- buoyant force | 浮力 | The upward force a fluid exerts on a submerged object due to pressure differences | 由于液体压强随深度增加，物体下表面受到的压力大于上表面，产生向上的浮力。 | A boat floats when the buoyant force equals its weight. | 2
  rel: Archimedes' principle
- Archimedes' principle | 阿基米德原理 | The buoyant force on an object equals the weight of the fluid it displaces | 浮力等于物体排开液体的重力。 | A submerged block displacing 2 N of water experiences a 2 N buoyant force. | 2
  rel: buoyant force
- continuity equation | 连续性方程 | For an incompressible fluid, flow rate is constant, so A₁v₁ = A₂v₂ | 不可压缩流体流量不变，横截面积变小，流速变大。 | Covering part of a hose opening makes the water exit faster. | 2
  rel: Bernoulli's principle
- Bernoulli's principle | 伯努利原理 | In a moving fluid at constant height, faster flow corresponds to lower pressure | 在同一高度，流速越大的地方压强越小，是流体中的能量守恒。 | Air moving faster over a curved surface creates lower pressure there. | 3
  rel: continuity equation

# ---------------- Practice items (original) ----------------
@q p1-u1-001 | UNDERSTAND | CONCEPT | SCENARIO | 1 | 2 | acceleration; velocity
? A ball is thrown straight up. At the very top of its path, which statement is correct (ignore air resistance)?
= Its velocity and acceleration are both zero. :: Acceleration remains g downward throughout the flight.
=* Its velocity is zero, but its acceleration is 9.8 m/s² downward. :: Correct — gravity keeps acting even when the ball momentarily stops.
= Its velocity is maximum and its acceleration is zero. :: Velocity is zero at the top.
= Its acceleration points upward. :: Gravity always points downward.
! Zero velocity does not imply zero acceleration. Gravity changes the velocity at a constant rate at every point.
!zh 速度为零不代表加速度为零。整个过程中重力都在以恒定的加速度改变速度。
@q p1-u1-002 | APPLY | APPLICATION | GRAPH | 1 | 2 | velocity-time graph; displacement
? On a velocity-time graph, how do you find an object's displacement between two times?
vis: motion-graph vt
=* Find the area between the graph and the time axis. :: Correct — area under v-t equals displacement.
= Find the slope of the graph. :: Slope of v-t gives acceleration.
= Read the final velocity value. :: That is velocity, not displacement.
= Multiply the slope by the time interval. :: That gives change in velocity.
! On a v-t graph: slope = acceleration, area = displacement.
!zh 速度-时间图：斜率 = 加速度，面积 = 位移。
@q p1-u2-001 | UNDERSTAND | CONCEPT | SCENARIO | 2 | 2 | Newton's third law
? A large truck collides with a small car. During the collision, how does the force of the truck on the car compare to the force of the car on the truck?
= The truck's force is larger because it has more mass. :: Third-law pairs are always equal in magnitude.
=* The forces are equal in magnitude and opposite in direction. :: Correct — they form a Newton's third law pair.
= The car's force is larger because the car accelerates more. :: The car accelerates more because of its smaller mass, not a larger force.
= There is no force on the truck. :: Every interaction involves forces on both objects.
! Newton's third law: interaction forces are equal and opposite and act on different objects. The car's acceleration is larger because a = F/m.
!zh 牛顿第三定律：相互作用力大小相等、方向相反，作用在不同物体上。小车加速度大是因为质量小。
@q p1-u2-002 | APPLY | APPLICATION | MCQ | 2 | 2 | net force; Newton's second law
? A 4 kg cart is pulled with 20 N to the right while friction exerts 8 N to the left. What is the cart's acceleration?
= 5 m/s² right :: This ignores friction.
=* 3 m/s² right :: Correct — net force = 12 N right; a = 12/4.
= 7 m/s² right :: This adds the forces instead of subtracting.
= 2 m/s² left :: The net force points right.
! Find the net force first: 20 N − 8 N = 12 N right. Then a = ΣF/m = 3 m/s².
!zh 先求合力：20 − 8 = 12 N（向右），再用 a = ΣF/m = 3 m/s²。
@q p1-u3-001 | APPLY | APPLICATION | MCQ | 3 | 2 | kinetic energy
? If a car's speed doubles, its kinetic energy
= doubles. :: KE depends on v², not v.
=* quadruples. :: Correct — (2v)² = 4v².
= stays the same. :: KE depends on speed.
= halves. :: KE increases with speed.
! KE = ½mv², so doubling v multiplies KE by 4.
!zh KE = ½mv²，速度加倍，动能变为 4 倍。
@q p1-u4-001 | UNDERSTAND | CONCEPT | SCENARIO | 4 | 2 | impulse; momentum
? Why do gymnasts land on thick mats instead of a hard floor?
=* The mat increases the stopping time, reducing the average force for the same change in momentum. :: Correct — J = FΔt; larger Δt means smaller F.
= The mat reduces the gymnast's change in momentum. :: The gymnast still stops, so Δp is the same.
= The mat increases the gymnast's kinetic energy. :: The mat absorbs energy.
= The mat eliminates the impulse. :: Impulse is still needed to stop the gymnast.
! The change in momentum is fixed; extending the collision time lowers the average force.
!zh 动量变化量不变，延长作用时间可以减小平均冲击力。
@q p1-u4-002 | APPLY | APPLICATION | MCQ | 4 | 3 | inelastic collision; conservation of momentum
? A 2 kg cart moving at 3 m/s collides with and sticks to a stationary 1 kg cart. What is their speed afterward?
= 3 m/s :: Total mass increased, so speed must drop.
=* 2 m/s :: Correct — momentum 6 kg·m/s ÷ 3 kg.
= 1.5 m/s :: Check total mass: 2 + 1 = 3 kg.
= 1 m/s :: Momentum must be conserved.
! Perfectly inelastic: m₁v₁ = (m₁ + m₂)v′ → 6 = 3v′ → v′ = 2 m/s. Kinetic energy is not conserved.
!zh 完全非弹性碰撞：动量守恒 6 = 3v′，v′ = 2 m/s；动能不守恒。
@q p1-u5-001 | UNDERSTAND | CONCEPT | SCENARIO | 5 | 2 | torque; lever arm
? Why is it easier to open a door by pushing near the handle than near the hinges?
= The force is larger near the handle. :: You can apply the same force at either point.
=* The lever arm is longer, so the same force produces more torque. :: Correct — τ = rF.
= The door's mass is smaller near the handle. :: Mass distribution does not change based on where you push.
= Friction is smaller near the handle. :: Friction at the hinge is not affected by where you push.
! Torque depends on the lever arm. A larger r produces a larger torque for the same force.
!zh 力矩 τ = rF，力臂越大，同样的力产生的力矩越大。
@q p1-u6-001 | APPLY | APPLICATION | SCENARIO | 6 | 3 | conservation of angular momentum
? A spinning ice skater pulls her arms in. What happens to her angular velocity and why?
=* It increases, because her rotational inertia decreases while angular momentum is conserved. :: Correct — L = Iω constant.
= It decreases, because she loses angular momentum. :: No external torque acts, so L is conserved.
= It stays the same, because no torque acts. :: L is constant, but ω changes when I changes.
= It increases, because her arms exert an external torque. :: Her arms are internal to the system.
! With no external torque, L = Iω is constant. Pulling mass inward lowers I, so ω increases.
!zh 无外力矩时 L = Iω 不变。手臂收拢使 I 减小，ω 增大。
@q p1-u7-001 | UNDERSTAND | CONCEPT | MCQ | 7 | 2 | period; pendulum
? Which change would increase the period of a simple pendulum?
= Using a heavier bob :: Period does not depend on mass.
=* Using a longer string :: Correct — T = 2π√(L/g).
= Pulling it back slightly farther (small angles) :: For small angles, period is independent of amplitude.
= Moving it to a planet with stronger gravity :: Larger g decreases the period.
! T = 2π√(L/g). Only length and gravitational field strength matter.
!zh T = 2π√(L/g)，只与摆长和重力加速度有关。
@q p1-u8-001 | APPLY | APPLICATION | SCENARIO | 8 | 2 | Archimedes' principle; buoyant force
? A block floats in water. What is the buoyant force on the block?
=* Equal to the block's weight :: Correct — for a floating object, buoyant force balances weight.
= Greater than the block's weight :: Then the block would accelerate upward.
= Equal to the weight of a volume of water equal to the whole block :: Only the submerged volume displaces water.
= Zero, because the block floats :: Floating requires an upward buoyant force.
! A floating object is in equilibrium, so the buoyant force equals its weight, which also equals the weight of the water displaced.
!zh 漂浮物体处于平衡状态，浮力 = 重力 = 排开水的重力。

@pair velocity-vs-acceleration | velocity | acceleration
! Velocity tells how fast and in what direction position changes; acceleration tells how fast velocity changes.
!zh 速度描述位置变化的快慢和方向；加速度描述速度变化的快慢。
d: Rate of change of :: Position :: Velocity
d: Can one be zero while the other is not? :: Yes — at the top of a toss, v = 0 but a = g :: Yes — constant velocity means a = 0
s: B :: A car's speedometer climbs from 20 to 40 km/h. :: Velocity changing = acceleration.
s: A :: A cyclist rides north at a steady 5 m/s. :: Constant velocity, zero acceleration.
s: B :: A ball moving in a circle at constant speed. :: Changing direction is acceleration.
s: A :: The slope of a position-time graph. :: That slope gives velocity.
@pair momentum-vs-ke | momentum | kinetic energy
! Momentum (p = mv) is a vector and is always conserved in isolated collisions; kinetic energy (½mv²) is a scalar and is conserved only in elastic collisions.
!zh 动量 p = mv 是矢量，在孤立系统碰撞中总守恒；动能 ½mv² 是标量，只有弹性碰撞中守恒。
d: Formula :: mv :: ½mv²
d: Vector or scalar :: Vector :: Scalar
d: Conserved in inelastic collisions? :: Yes :: No
s: A :: Two carts stick together; the total of mv is the same before and after. :: Conserved quantity in all collisions.
s: B :: Doubling speed makes this quantity four times larger. :: Depends on v².
s: B :: In a crash, some of this is converted to heat and sound. :: KE is not conserved in inelastic collisions.
s: A :: This quantity can be negative depending on direction. :: Vectors have direction.
@pair mass-vs-weight | mass | weight
! Mass is the amount of matter (kg) and does not change with location; weight is the gravitational force on that mass (N) and does.
!zh 质量是物质的多少（kg），不随位置变化；重量是重力（N），随重力场变化。
d: Unit :: kilogram (kg) :: newton (N)
d: Changes on the Moon? :: No :: Yes
s: A :: A 60 kg astronaut is still 60 kg on the Moon. :: Mass is unchanged.
s: B :: A scale reads lower on the Moon. :: The gravitational force is smaller.
s: B :: Calculated as m × g. :: That is weight.
s: A :: Measures an object's inertia. :: Mass measures inertia.
