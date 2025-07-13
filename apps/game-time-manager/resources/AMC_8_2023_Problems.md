# AMC 8 2023 Problems

## Problem 1

What is the value of
![$(8 \times 4 + 2) - (8 + 4 \times 2)$](images/2023/c1483a016785d8481f90f7b8a41b9480bd806ede.png)
?
![$\textbf{(A)}\ 0 \qquad \textbf{(B)}\ 6 \qquad \textbf{(C)}\ 10 \qquad \textbf{(D)}\ 18 \qquad \textbf{(E)}\ 24$](images/2023/5a2cf6341b2d680d59cf0be9ea17d2124a745512.png)

---

## Problem 2

A square piece of paper is folded twice into four equal quarters, as shown below, then cut along the dashed line. When unfolded, the paper will match which of the following figures?
![[asy]  //Restored original diagram. Alter it if you would like, but it was made by TheMathGuyd, // Diagram by TheMathGuyd. I even put the lined texture :) // Thank you Kante314 for inspiring thicker arrows. They do look much better size(0,3cm); path sq = (-0.5,-0.5)--(0.5,-0.5)--(0.5,0.5)--(-0.5,0.5)--cycle; path rh = (-0.125,-0.125)--(0.5,-0.5)--(0.5,0.5)--(-0.125,0.875)--cycle; path sqA = (-0.5,-0.5)--(-0.25,-0.5)--(0,-0.25)--(0.25,-0.5)--(0.5,-0.5)--(0.5,-0.25)--(0.25,0)--(0.5,0.25)--(0.5,0.5)--(0.25,0.5)--(0,0.25)--(-0.25,0.5)--(-0.5,0.5)--(-0.5,0.25)--(-0.25,0)--(-0.5,-0.25)--cycle; path sqB = (-0.5,-0.5)--(-0.25,-0.5)--(0,-0.25)--(0.25,-0.5)--(0.5,-0.5)--(0.5,0.5)--(0.25,0.5)--(0,0.25)--(-0.25,0.5)--(-0.5,0.5)--cycle; path sqC = (-0.25,-0.25)--(0.25,-0.25)--(0.25,0.25)--(-0.25,0.25)--cycle; path trD = (-0.25,0)--(0.25,0)--(0,0.25)--cycle; path sqE = (-0.25,0)--(0,-0.25)--(0.25,0)--(0,0.25)--cycle; filldraw(sq,mediumgrey,black); draw((0.75,0)--(1.25,0),currentpen+1,Arrow(size=6)); //folding path sqside = (-0.5,-0.5)--(0.5,-0.5); path rhside = (-0.125,-0.125)--(0.5,-0.5); transform fld = shift((1.75,0))*scale(0.5); draw(fld*sq,black); int i; for(i=0; i<10; i=i+1) {   draw(shift(0,0.05*i)*fld*sqside,deepblue); } path rhedge = (-0.125,-0.125)--(-0.125,0.8)--(-0.2,0.85)--cycle; filldraw(fld*rhedge,grey); path sqedge = (-0.5,-0.5)--(-0.5,0.4475)--(-0.575,0.45)--cycle; filldraw(fld*sqedge,grey); filldraw(fld*rh,white,black); int i; for(i=0; i<10; i=i+1) {   draw(shift(0,0.05*i)*fld*rhside,deepblue); } draw((2.25,0)--(2.75,0),currentpen+1,Arrow(size=6)); //cutting transform cut = shift((3.25,0))*scale(0.5); draw(shift((-0.01,+0.01))*cut*sq); draw(cut*sq); filldraw(shift((0.01,-0.01))*cut*sq,white,black); int j; for(j=0; j<10; j=j+1) { draw(shift(0,0.05*j)*cut*sqside,deepblue); } draw(shift((0.01,-0.01))*cut*(0,-0.5)--shift((0.01,-0.01))*cut*(0.5,0),dashed); //Answers Below, but already Separated //filldraw(sqA,grey,black); //filldraw(sqB,grey,black); //filldraw(sq,grey,black); //filldraw(sqC,white,black); //filldraw(sq,grey,black); //filldraw(trD,white,black); //filldraw(sq,grey,black); //filldraw(sqE,white,black); [/asy]](images/2023/6d385621437744e469b64fd20d5c8183e9e93ac1.png)
![[asy] // Diagram by TheMathGuyd. size(0,7.5cm); path sq = (-0.5,-0.5)--(0.5,-0.5)--(0.5,0.5)--(-0.5,0.5)--cycle; path rh = (-0.125,-0.125)--(0.5,-0.5)--(0.5,0.5)--(-0.125,0.875)--cycle; path sqA = (-0.5,-0.5)--(-0.25,-0.5)--(0,-0.25)--(0.25,-0.5)--(0.5,-0.5)--(0.5,-0.25)--(0.25,0)--(0.5,0.25)--(0.5,0.5)--(0.25,0.5)--(0,0.25)--(-0.25,0.5)--(-0.5,0.5)--(-0.5,0.25)--(-0.25,0)--(-0.5,-0.25)--cycle; path sqB = (-0.5,-0.5)--(-0.25,-0.5)--(0,-0.25)--(0.25,-0.5)--(0.5,-0.5)--(0.5,0.5)--(0.25,0.5)--(0,0.25)--(-0.25,0.5)--(-0.5,0.5)--cycle; path sqC = (-0.25,-0.25)--(0.25,-0.25)--(0.25,0.25)--(-0.25,0.25)--cycle; path trD = (-0.25,0)--(0.25,0)--(0,0.25)--cycle; path sqE = (-0.25,0)--(0,-0.25)--(0.25,0)--(0,0.25)--cycle;  //ANSWERS real sh = 1.5; label("$\textbf{(A)}$",(-0.5,0.5),SW); label("$\textbf{(B)}$",shift((sh,0))*(-0.5,0.5),SW); label("$\textbf{(C)}$",shift((2sh,0))*(-0.5,0.5),SW); label("$\textbf{(D)}$",shift((0,-sh))*(-0.5,0.5),SW); label("$\textbf{(E)}$",shift((sh,-sh))*(-0.5,0.5),SW); filldraw(sqA,mediumgrey,black); filldraw(shift((sh,0))*sqB,mediumgrey,black); filldraw(shift((2*sh,0))*sq,mediumgrey,black); filldraw(shift((2*sh,0))*sqC,white,black); filldraw(shift((0,-sh))*sq,mediumgrey,black); filldraw(shift((0,-sh))*trD,white,black); filldraw(shift((sh,-sh))*sq,mediumgrey,black); filldraw(shift((sh,-sh))*sqE,white,black); [/asy]](images/2023/0f8ca5448d7ae5672368a192ed9ee5af7a40419b.png)

---

## Problem 3

Wind chill
is a measure of how cold people feel when exposed to wind outside. A good estimate for wind chill can be found using this calculation
![\[(\text{wind chill}) = (\text{air temperature}) - 0.7 \times (\text{wind speed}),\]](images/2023/66810c2843261301faabc4441239f8fa51b1f231.png)
where temperature is measured in degrees Fahrenheit
![$(^{\circ}\text{F})$](images/2023/50825c320108cf386419b90d13b40038bb67b5fc.png)
and the wind speed is measured in miles per hour (mph). Suppose the air temperature is
![$36^{\circ}\text{F}$](images/2023/98e5583028cdbf68ab0b262d5808fb705b30a15d.png)
and the wind speed is
![$18$](images/2023/5e7a1b6098a8c98b8e4adae526aeef4b91712620.png)
mph. Which of the following is closest to the approximate wind chill?
![$\textbf{(A)}\ 18 \qquad \textbf{(B)}\ 23 \qquad \textbf{(C)}\ 28 \qquad \textbf{(D)}\ 32 \qquad \textbf{(E)}\ 35$](images/2023/1ab27a378df7ae3d311c15288f4fbcf3267b0fbb.png)

---

## Problem 4

The numbers from
![$1$](images/2023/dce34f4dfb2406144304ad0d6106c5382ddd1446.png)
to
![$49$](images/2023/34c8e6bf4d57cd6f2bb0d7d43e00f0f442f53b84.png)
are arranged in a spiral pattern on a square grid, beginning at the center. The first few numbers have been entered into the grid below. Consider the four numbers that will appear in the shaded squares, on the same diagonal as the number
![$7.$](images/2023/b17ce6fcb2994d4241d780dd5311d828db133411.png)
How many of these four numbers are prime?
![[asy] /* Made by MRENTHUSIASM */ size(175);  void ds(pair p) { 	filldraw((0.5,0.5)+p--(-0.5,0.5)+p--(-0.5,-0.5)+p--(0.5,-0.5)+p--cycle,mediumgrey); }  ds((0.5,4.5)); ds((1.5,3.5)); ds((3.5,1.5)); ds((4.5,0.5));  add(grid(7,7,grey+linewidth(1.25)));  int adj = 1; int curUp = 2; int curLeft = 4; int curDown = 6;  label("$1$",(3.5,3.5));  for (int len = 3; len<=3; len+=2) { 	for (int i=1; i<=len-1; ++i)     		{ 			label("$"+string(curUp)+"$",(3.5+adj,3.5-adj+i));     		label("$"+string(curLeft)+"$",(3.5+adj-i,3.5+adj));      		label("$"+string(curDown)+"$",(3.5-adj,3.5+adj-i));     		++curDown;     		++curLeft;     		++curUp; 		} 	++adj;     curUp = len^2 + 1;     curLeft = len^2 + len + 2;     curDown = len^2 + 2*len + 3; }  draw((4,4)--(3,4)--(3,3)--(5,3)--(5,5)--(2,5)--(2,2)--(6,2)--(6,6)--(1,6)--(1,1)--(7,1)--(7,7)--(0,7)--(0,0)--(7,0),linewidth(2)); [/asy]](images/2023/6e88180afd53a16ea3b9e0389e44933a31876e70.png)
![$\textbf{(A)}\ 0 \qquad \textbf{(B)}\ 1 \qquad \textbf{(C)}\ 2 \qquad \textbf{(D)}\ 3 \qquad \textbf{(E)}\ 4$](images/2023/0bcd5bbd626bd1e1ecd06b5e602defd55c570b1f.png)

---

## Problem 5

A lake contains
![$250$](images/2023/448b3c8f2596d1b93b4b3ef199f8b3241ced9da2.png)
trout, along with a variety of other fish. When a marine biologist catches and releases a sample of
![$180$](images/2023/5cb1b41850ab676e4d1cf15c69b1609af4befbc5.png)
fish from the lake,
![$30$](images/2023/651ba418a810d971dbc8a326d49a71fe1541fae0.png)
are identified as trout. Assume that the ratio of trout to the total number of fish is the same in both the sample and the lake. How many fish are there in the lake?
![$\textbf{(A)}\ 1250 \qquad \textbf{(B)}\ 1500 \qquad \textbf{(C)}\ 1750 \qquad \textbf{(D)}\ 1800 \qquad \textbf{(E)}\ 2000$](images/2023/dedba598f57852de73aba3eee70d2bdc1f701ee2.png)

---

## Problem 6

The digits
![$2, 0, 2,$](images/2023/438d1461ac4f7a141fdd596d4a8afd43ba1c9c93.png)
and
![$3$](images/2023/7cde695f2e4542fd01f860a89189f47a27143b66.png)
are placed in the expression below, one digit per box. What is the maximum possible value of the expression?
![[asy] // Diagram by TheMathGuyd. I can compress this later size(5cm); real w=2.2; pair O,I,J; O=(0,0);I=(1,0);J=(0,1); path bsqb = O--I; path bsqr = I--I+J; path bsqt = I+J--J; path bsql = J--O; path lsqb = shift((1.2,0.75))*scale(0.5)*bsqb; path lsqr = shift((1.2,0.75))*scale(0.5)*bsqr; path lsqt = shift((1.2,0.75))*scale(0.5)*bsqt; path lsql = shift((1.2,0.75))*scale(0.5)*bsql; draw(bsqb,dashed); draw(bsqr,dashed); draw(bsqt,dashed); draw(bsql,dashed); draw(lsqb,dashed); draw(lsqr,dashed); draw(lsqt,dashed); draw(lsql,dashed); label(scale(3)*"$\times$",(w,1/3)); draw(shift(1.3w,0)*bsqb,dashed); draw(shift(1.3w,0)*bsqr,dashed); draw(shift(1.3w,0)*bsqt,dashed); draw(shift(1.3w,0)*bsql,dashed); draw(shift(1.3w,0)*lsqb,dashed); draw(shift(1.3w,0)*lsqr,dashed); draw(shift(1.3w,0)*lsqt,dashed); draw(shift(1.3w,0)*lsql,dashed); [/asy]](images/2023/4e639504d3a7127498b862326310586835b4dfa3.png)
![$\textbf{(A)}\ 0 \qquad \textbf{(B)}\ 8 \qquad \textbf{(C)}\ 9 \qquad \textbf{(D)}\ 16 \qquad \textbf{(E)}\ 18$](images/2023/0d612776f99c86cc0475ab31f5cadd22963802bb.png)

---

## Problem 7

A rectangle, with sides parallel to the
![$x$](images/2023/26eeb5258ca5099acf8fe96b2a1049c48c89a5e6.png)
-axis and
![$y$](images/2023/092e364e1d9d19ad5fffb0b46ef4cc7f2da02c1c.png)
-axis, has opposite vertices located at
![$(15, 3)$](images/2023/369f25e046708ea40ec93bbb3dcbc60cf292c600.png)
and
![$(16, 5)$](images/2023/bfc33574d40d9ab55f1975809957c652404b88e0.png)
. A line is drawn through points
![$A(0, 0)$](images/2023/2f12d9fe54dd3a92528b0439c29fb7baa5f6b978.png)
and
![$B(3, 1)$](images/2023/a28c3eb6327cf3e1eb9253e7fa6ab96825701c17.png)
. Another line is drawn through points
![$C(0, 10)$](images/2023/6cfba96a1a74d455508dcfb80e767010863d5bd5.png)
and
![$D(2, 9)$](images/2023/9c6f48fcc9307577c15deadb2ebdfe297fa80992.png)
. How many points on the rectangle lie on at least one of the two lines?
![[asy] usepackage("mathptmx"); size(9cm); draw((0,-.5)--(0,11),EndArrow(size=.15cm)); draw((1,0)--(1,11),mediumgray); draw((2,0)--(2,11),mediumgray); draw((3,0)--(3,11),mediumgray); draw((4,0)--(4,11),mediumgray); draw((5,0)--(5,11),mediumgray); draw((6,0)--(6,11),mediumgray); draw((7,0)--(7,11),mediumgray); draw((8,0)--(8,11),mediumgray); draw((9,0)--(9,11),mediumgray); draw((10,0)--(10,11),mediumgray); draw((11,0)--(11,11),mediumgray); draw((12,0)--(12,11),mediumgray); draw((13,0)--(13,11),mediumgray); draw((14,0)--(14,11),mediumgray); draw((15,0)--(15,11),mediumgray); draw((16,0)--(16,11),mediumgray);  draw((-.5,0)--(17,0),EndArrow(size=.15cm)); draw((0,1)--(17,1),mediumgray); draw((0,2)--(17,2),mediumgray); draw((0,3)--(17,3),mediumgray); draw((0,4)--(17,4),mediumgray); draw((0,5)--(17,5),mediumgray); draw((0,6)--(17,6),mediumgray); draw((0,7)--(17,7),mediumgray); draw((0,8)--(17,8),mediumgray); draw((0,9)--(17,9),mediumgray); draw((0,10)--(17,10),mediumgray);  draw((-.13,1)--(.13,1)); draw((-.13,2)--(.13,2)); draw((-.13,3)--(.13,3)); draw((-.13,4)--(.13,4)); draw((-.13,5)--(.13,5)); draw((-.13,6)--(.13,6)); draw((-.13,7)--(.13,7)); draw((-.13,8)--(.13,8)); draw((-.13,9)--(.13,9)); draw((-.13,10)--(.13,10));  draw((1,-.13)--(1,.13)); draw((2,-.13)--(2,.13)); draw((3,-.13)--(3,.13)); draw((4,-.13)--(4,.13)); draw((5,-.13)--(5,.13)); draw((6,-.13)--(6,.13)); draw((7,-.13)--(7,.13)); draw((8,-.13)--(8,.13)); draw((9,-.13)--(9,.13)); draw((10,-.13)--(10,.13)); draw((11,-.13)--(11,.13)); draw((12,-.13)--(12,.13)); draw((13,-.13)--(13,.13)); draw((14,-.13)--(14,.13)); draw((15,-.13)--(15,.13)); draw((16,-.13)--(16,.13));  label(scale(.7)*"$1$", (1,-.13), S); label(scale(.7)*"$2$", (2,-.13), S); label(scale(.7)*"$3$", (3,-.13), S); label(scale(.7)*"$4$", (4,-.13), S); label(scale(.7)*"$5$", (5,-.13), S); label(scale(.7)*"$6$", (6,-.13), S); label(scale(.7)*"$7$", (7,-.13), S); label(scale(.7)*"$8$", (8,-.13), S); label(scale(.7)*"$9$", (9,-.13), S); label(scale(.7)*"$10$", (10,-.13), S); label(scale(.7)*"$11$", (11,-.13), S); label(scale(.7)*"$12$", (12,-.13), S); label(scale(.7)*"$13$", (13,-.13), S); label(scale(.7)*"$14$", (14,-.13), S); label(scale(.7)*"$15$", (15,-.13), S); label(scale(.7)*"$16$", (16,-.13), S);  label(scale(.7)*"$1$", (-.13,1), W); label(scale(.7)*"$2$", (-.13,2), W); label(scale(.7)*"$3$", (-.13,3), W); label(scale(.7)*"$4$", (-.13,4), W); label(scale(.7)*"$5$", (-.13,5), W); label(scale(.7)*"$6$", (-.13,6), W); label(scale(.7)*"$7$", (-.13,7), W); label(scale(.7)*"$8$", (-.13,8), W); label(scale(.7)*"$9$", (-.13,9), W); label(scale(.7)*"$10$", (-.13,10), W);   dot((0,0),linewidth(4)); label(scale(.75)*"$A$", (0,0), NE); dot((3,1),linewidth(4)); label(scale(.75)*"$B$", (3,1), NE);  dot((0,10),linewidth(4)); label(scale(.75)*"$C$", (0,10), NE); dot((2,9),linewidth(4)); label(scale(.75)*"$D$", (2,9), NE);  draw((15,3)--(16,3)--(16,5)--(15,5)--cycle,linewidth(1.125)); dot((15,3),linewidth(4)); dot((16,3),linewidth(4)); dot((16,5),linewidth(4)); dot((15,5),linewidth(4)); [/asy]](images/2023/3f2bc5fa9ed29072b71e62f652eec4cdbbf3f142.png)
![$\textbf{(A)}\ 0 \qquad \textbf{(B)}\ 1 \qquad \textbf{(C)}\ 2 \qquad \textbf{(D)}\ 3 \qquad \textbf{(E)}\ 4$](images/2023/0bcd5bbd626bd1e1ecd06b5e602defd55c570b1f.png)

---

## Problem 8

Lola, Lolo, Tiya, and Tiyo participated in a ping pong tournament. Each player competed against each of the other three players exactly twice. Shown below are the win-loss records for the players. The numbers
![$1$](images/2023/dce34f4dfb2406144304ad0d6106c5382ddd1446.png)
and
![$0$](images/2023/bc1f9d9bf8a1b606a4188b5ce9a2af1809e27a89.png)
represent a win or loss, respectively. For example, Lola won five matches and lost the fourth match. What was Tiyo’s win-loss record?
![\[\begin{tabular}{c | c} Player & Result \\ \hline Lola & \texttt{111011}\\ Lolo & \texttt{101010}\\ Tiya & \texttt{010100}\\ Tiyo & \texttt{??????} \end{tabular}\]](images/2023/c136a605154465c99d38f4ee944f29137bfb226a.png)
![$\textbf{(A)}\ \texttt{000101} \qquad \textbf{(B)}\ \texttt{001001} \qquad \textbf{(C)}\ \texttt{010000} \qquad \textbf{(D)}\ \texttt{010101} \qquad \textbf{(E)}\ \texttt{011000}$](images/2023/2f864ccc76be9adc32edd15f6b519277dfd87e01.png)

---

## Problem 9

Malaika is skiing on a mountain. The graph below shows her elevation, in meters, above the base of the mountain as she skis along a trail. In total, how many seconds does she spend at an elevation between
![$4$](images/2023/c7cab1a05e1e0c1d51a6a219d96577a16b7abf9d.png)
and
![$7$](images/2023/e0a0db32027a732ac57d37ef2ae9bb150f65b108.png)
meters?
![[asy] // Diagram by TheMathGuyd. Found cubic, so graph is perfect. import graph; size(8cm); int i; for(i=1; i<9; i=i+1) { draw((-0.2,2i-1)--(16.2,2i-1), mediumgrey); draw((2i-1,-0.2)--(2i-1,16.2), mediumgrey); draw((-0.2,2i)--(16.2,2i), grey); draw((2i,-0.2)--(2i,16.2), grey); } Label f;  f.p=fontsize(6);  xaxis(-0.5,17.8,Ticks(f, 2.0),Arrow());  yaxis(-0.5,17.8,Ticks(f, 2.0),Arrow());  real f(real x)  {  return -0.03125 x^(3) + 0.75x^(2) - 5.125 x + 14.5;  }  draw(graph(f,0,15.225),currentpen+1); real dpt=2; real ts=0.75; transform st=scale(ts); label(rotate(90)*st*"Elevation (meters)",(-dpt,8)); label(st*"Time (seconds)",(8,-dpt)); [/asy]](images/2023/8fb400c99ed94b8b0a7d87fc66909b3cde3ca1fa.png)
![$\textbf{(A)}\ 6 \qquad \textbf{(B)}\ 8 \qquad \textbf{(C)}\ 10 \qquad \textbf{(D)}\ 12 \qquad \textbf{(E)}\ 14$](images/2023/2156f0393e81016091a8ff1e9ed25ffc335eb3ee.png)

---

## Problem 10

Harold made a plum pie to take on a picnic. He was able to eat only
![$\frac{1}{4}$](images/2023/c339afa03e060d959e4942be7522c0c992f4c41c.png)
of the pie, and he left the rest for his friends. A moose came by and ate
![$\frac{1}{3}$](images/2023/4e1965f8d70832ded66434c75a7bd52b75090af0.png)
of what Harold left behind. After that, a porcupine ate
![$\frac{1}{3}$](images/2023/4e1965f8d70832ded66434c75a7bd52b75090af0.png)
of what the moose left behind. How much of the original pie still remained after the porcupine left?
![$\textbf{(A)}\ \frac{1}{12} \qquad \textbf{(B)}\ \frac{1}{6} \qquad \textbf{(C)}\ \frac{1}{4} \qquad \textbf{(D)}\ \frac{1}{3} \qquad \textbf{(E)}\ \frac{5}{12}$](images/2023/e19562d5868a4659821511d7007cda39d3587d92.png)

---

## Problem 11

NASA’s Perseverance Rover was launched on July
![$30,$](images/2023/72f1e19ce0046fe93153f4a699dbe21d86fe9b30.png)
![$2020.$](images/2023/c49cb68f7a39d116c71338faa7d320152186d1f9.png)
After traveling
![$292{,}526{,}838$](images/2023/5f90a30d5daeccd8fa5e8f1982a055b446ac60b9.png)
miles, it landed on Mars in Jezero Crater about
![$6.5$](images/2023/7314f8133d3b925b9ce6598191d153da7ecdd779.png)
months later. Which of the following is closest to the Rover’s average interplanetary speed in miles per hour?
![$\textbf{(A)}\ 6{,}000 \qquad \textbf{(B)}\ 12{,}000 \qquad \textbf{(C)}\ 60{,}000 \qquad \textbf{(D)}\ 120{,}000 \qquad \textbf{(E)}\ 600{,}000$](images/2023/0b1d14017f522609f9892e3979377f2e13c7ae13.png)

---

## Problem 12

The figure below shows a large white circle with a number of smaller white and shaded circles in its
interior. What fraction of the interior of the large white circle is shaded?
![[asy] // Diagram by TheMathGuyd size(6cm); draw(circle((3,3),3)); filldraw(circle((2,3),2),lightgrey); filldraw(circle((3,3),1),white); filldraw(circle((1,3),1),white); filldraw(circle((5.5,3),0.5),lightgrey); filldraw(circle((4.5,4.5),0.5),lightgrey); filldraw(circle((4.5,1.5),0.5),lightgrey); int i, j; for(i=0; i<7; i=i+1) { draw((0,i)--(6,i), dashed+grey); draw((i,0)--(i,6), dashed+grey); } [/asy]](images/2023/8828bc341da153e3d2856185043028e8ceb903cf.png)
![$\textbf{(A)}\ \frac{1}{4} \qquad \textbf{(B)}\ \frac{11}{36} \qquad \textbf{(C)}\ \frac{1}{3} \qquad \textbf{(D)}\ \frac{19}{36} \qquad \textbf{(E)}\ \frac{5}{9}$](images/2023/652d90f234fca91abeadd1ee559753110f599dd8.png)

---

## Problem 13

Along the route of a bicycle race,
![$7$](images/2023/e0a0db32027a732ac57d37ef2ae9bb150f65b108.png)
water stations are evenly spaced between the start and finish lines,
as shown in the figure below. There are also
![$2$](images/2023/41c544263a265ff15498ee45f7392c5f86c6d151.png)
repair stations evenly spaced between the start and
finish lines. The
![$3$](images/2023/7cde695f2e4542fd01f860a89189f47a27143b66.png)
rd water station is located
![$2$](images/2023/41c544263a265ff15498ee45f7392c5f86c6d151.png)
miles after the
![$1$](images/2023/dce34f4dfb2406144304ad0d6106c5382ddd1446.png)
st repair station. How long is the race
in miles?
![[asy] // Credits given to Themathguyd‎ and Kante314 usepackage("mathptmx"); size(10cm); filldraw((11,4.5)--(171,4.5)--(171,17.5)--(11,17.5)--cycle,mediumgray*0.4 + lightgray*0.6); draw((11,11)--(171,11),linetype("2 2")+white+linewidth(1.2)); draw((0,0)--(11,0)--(11,22)--(0,22)--cycle); draw((171,0)--(182,0)--(182,22)--(171,22)--cycle);  draw((31,4.5)--(31,0)); draw((51,4.5)--(51,0)); draw((151,4.5)--(151,0));  label(scale(.85)*rotate(45)*"Water 1", (23,-13.5)); label(scale(.85)*rotate(45)*"Water 2", (43,-13.5)); label(scale(.85)*rotate(45)*"Water 7", (143,-13.5));  filldraw(circle((103,-13.5),.2)); filldraw(circle((98,-13.5),.2)); filldraw(circle((93,-13.5),.2)); filldraw(circle((88,-13.5),.2)); filldraw(circle((83,-13.5),.2));  label(scale(.85)*rotate(90)*"Start", (5.5,11)); label(scale(.85)*rotate(270)*"Finish", (176.5,11)); [/asy]](images/2023/efaa138f2f7bc240bc49299009af49a7fc9a0420.png)
![$\textbf{(A)}\ 8 \qquad \textbf{(B)}\ 16 \qquad \textbf{(C)}\ 24 \qquad \textbf{(D)}\ 48 \qquad \textbf{(E)}\ 96$](images/2023/f900b9dc5316044f7fb157223de2e6dbf4319d75.png)

---

## Problem 14

Nicolas is planning to send a package to his friend Anton, who is a stamp collector. To pay for the postage, Nicolas would like to cover the package with a large number of stamps. Suppose he has a collection of
![$5$](images/2023/79069377f91364c2f87a64e5f9f562a091c8a6c1.png)
-cent,
![$10$](images/2023/fc606f7f1e530731ab4f1cc364c01dc64a4455ee.png)
-cent, and
![$25$](images/2023/66644fd9f411299c3c1eabf151b5f601c9ef6c21.png)
-cent stamps, with exactly
![$20$](images/2023/f8366cd6196dd8a9da6d38a3e9eafb109e99d53e.png)
of each type. What is the greatest number of stamps Nicolas can use to make exactly
![$7.10$](images/2023/b69c271f2e4b51399ffb4ca45fc25192d89a9fb7.png)
in postage?
(Note: The amount
![$7.10$](images/2023/b69c271f2e4b51399ffb4ca45fc25192d89a9fb7.png)
corresponds to
![$7$](images/2023/e0a0db32027a732ac57d37ef2ae9bb150f65b108.png)
dollars and
![$10$](images/2023/fc606f7f1e530731ab4f1cc364c01dc64a4455ee.png)
cents. One dollar is worth
![$100$](images/2023/e59e2c6e83eb78cca610a5fd4070ae01c8d4ae60.png)
cents.)
![$\textbf{(A)}\ 45 \qquad \textbf{(B)}\ 46 \qquad \textbf{(C)}\ 51 \qquad \textbf{(D)}\ 54\qquad \textbf{(E)}\ 55$](images/2023/1e9795b214b0c8b5ee9bbd1e8bbd81badcbfe4f3.png)

---

## Problem 15

Viswam walks half a mile to get to school each day. His route consists of
![$10$](images/2023/fc606f7f1e530731ab4f1cc364c01dc64a4455ee.png)
city blocks of equal length and he takes
![$1$](images/2023/dce34f4dfb2406144304ad0d6106c5382ddd1446.png)
minute to walk each block. Today, after walking
![$5$](images/2023/79069377f91364c2f87a64e5f9f562a091c8a6c1.png)
blocks, Viswam discovers he has to make a detour, walking
![$3$](images/2023/7cde695f2e4542fd01f860a89189f47a27143b66.png)
blocks of equal length instead of
![$1$](images/2023/dce34f4dfb2406144304ad0d6106c5382ddd1446.png)
block to reach the next corner. From the time he starts his detour, at what speed, in mph, must he walk, in order to get to school at his usual time?
![[asy] // Diagram by TheMathGuyd size(13cm); // this is an important stickman to the left of the origin pair C=midpoint((-0.5,0.5)--(-0.6,0.05)); draw((-0.5,0.5)--(-0.6,0.05)); // Head to butt draw((-0.64,0.16)--(-0.7,0.2)--C--(-0.47,0.2)--(-0.4,0.22)); // LH-C-RH draw((-0.6,0.05)--(-0.55,-0.1)--(-0.57,-0.25)); draw((-0.6,0.05)--(-0.68,-0.12)--(-0.8,-0.20));  filldraw(circle((-0.5,0.5),0.1),white,black);  int i; real d,s; // gap and side d=0.2; s=1-2*d; for(i=0; i<10; i=i+1) {   //dot((i,0), red); //marks to start   filldraw((i+d,d)--(i+1-d,d)--(i+1-d,1-d)--(i+d,1-d)--cycle, lightgrey, black);   filldraw(conj((i+d,d))--conj((i+1-d,d))--conj((i+1-d,1-d))--conj((i+d,1-d))--cycle,lightgrey,black); }  fill((5+d,-d/2)--(6-d,-d/2)--(6-d,d/2)--(5+d,d/2)--cycle,lightred);  draw((0,0)--(5,0)--(5,1)--(6,1)--(6,0)--(10.1,0),deepblue+linewidth(1.25)); //Who even noticed label("School", (10,0),E, Draw()); [/asy]](images/2023/f75d299d4b35cf040c71ccfca989da9a7787ce2b.png)
![$\textbf{(A)}\ 4 \qquad \textbf{(B)}\ 4.2 \qquad \textbf{(C)}\ 4.5 \qquad \textbf{(D)}\ 4.8 \qquad \textbf{(E)}\ 5$](images/2023/ed9f3414a250abda9e505652e8bc865bcd084d48.png)

---

## Problem 16

The letters
![$\text{P}, \text{Q},$](images/2023/73561d3c8514909b239777026c62d0a344291fc6.png)
and
![$\text{R}$](images/2023/e787ae9f9cc165e2da6347db095708a14c3b555c.png)
are entered into a
![$20\times20$](images/2023/7580a57f85b7fefb91ca2635a92fddb7581b1465.png)
table according to the pattern shown below. How many
![$\text{P}$](images/2023/14ff51e70197053469742052bdebe94cb064ae51.png)
s,
![$\text{Q}$](images/2023/b22add06881aafe9e77bc93e22ca3ffed3f47a3d.png)
s, and
![$\text{R}$](images/2023/e787ae9f9cc165e2da6347db095708a14c3b555c.png)
s will appear in the completed table?
![[asy] /* Made by MRENTHUSIASM, Edited by Kante314 */ usepackage("mathdots"); size(5cm); draw((0,0)--(6,0),linewidth(1.5)+mediumgray); draw((0,1)--(6,1),linewidth(1.5)+mediumgray); draw((0,2)--(6,2),linewidth(1.5)+mediumgray); draw((0,3)--(6,3),linewidth(1.5)+mediumgray); draw((0,4)--(6,4),linewidth(1.5)+mediumgray); draw((0,5)--(6,5),linewidth(1.5)+mediumgray);  draw((0,0)--(0,6),linewidth(1.5)+mediumgray); draw((1,0)--(1,6),linewidth(1.5)+mediumgray); draw((2,0)--(2,6),linewidth(1.5)+mediumgray); draw((3,0)--(3,6),linewidth(1.5)+mediumgray); draw((4,0)--(4,6),linewidth(1.5)+mediumgray); draw((5,0)--(5,6),linewidth(1.5)+mediumgray);  label(scale(.9)*"\textsf{P}", (.5,.5)); label(scale(.9)*"\textsf{Q}", (.5,1.5)); label(scale(.9)*"\textsf{R}", (.5,2.5)); label(scale(.9)*"\textsf{P}", (.5,3.5)); label(scale(.9)*"\textsf{Q}", (.5,4.5)); label("$\vdots$", (.5,5.6));  label(scale(.9)*"\textsf{Q}", (1.5,.5)); label(scale(.9)*"\textsf{R}", (1.5,1.5)); label(scale(.9)*"\textsf{P}", (1.5,2.5)); label(scale(.9)*"\textsf{Q}", (1.5,3.5)); label(scale(.9)*"\textsf{R}", (1.5,4.5)); label("$\vdots$", (1.5,5.6));  label(scale(.9)*"\textsf{R}", (2.5,.5)); label(scale(.9)*"\textsf{P}", (2.5,1.5)); label(scale(.9)*"\textsf{Q}", (2.5,2.5)); label(scale(.9)*"\textsf{R}", (2.5,3.5)); label(scale(.9)*"\textsf{P}", (2.5,4.5)); label("$\vdots$", (2.5,5.6));  label(scale(.9)*"\textsf{P}", (3.5,.5)); label(scale(.9)*"\textsf{Q}", (3.5,1.5)); label(scale(.9)*"\textsf{R}", (3.5,2.5)); label(scale(.9)*"\textsf{P}", (3.5,3.5)); label(scale(.9)*"\textsf{Q}", (3.5,4.5)); label("$\vdots$", (3.5,5.6));  label(scale(.9)*"\textsf{Q}", (4.5,.5)); label(scale(.9)*"\textsf{R}", (4.5,1.5)); label(scale(.9)*"\textsf{P}", (4.5,2.5)); label(scale(.9)*"\textsf{Q}", (4.5,3.5)); label(scale(.9)*"\textsf{R}", (4.5,4.5)); label("$\vdots$", (4.5,5.6));  label(scale(.9)*"$\dots$", (5.5,.5)); label(scale(.9)*"$\dots$", (5.5,1.5)); label(scale(.9)*"$\dots$", (5.5,2.5)); label(scale(.9)*"$\dots$", (5.5,3.5)); label(scale(.9)*"$\dots$", (5.5,4.5)); label(scale(.9)*"$\iddots$", (5.5,5.6)); [/asy]](images/2023/cb56c83bbe94022221482c1b9445b3a1810eeca2.png)
![$\textbf{(A)}~132\text{ Ps, }134\text{ Qs, }134\text{ Rs}$](images/2023/531e9160b56f50b9a4e087286c2898974f205668.png)
![$\textbf{(B)}~133\text{ Ps, }133\text{ Qs, }134\text{ Rs}$](images/2023/6bf854640a83eccb85c952f49f26989d36ddfc66.png)
![$\textbf{(C)}~133\text{ Ps, }134\text{ Qs, }133\text{ Rs}$](images/2023/220a0c05c1d5b43344df8c30a2906772565bfd0f.png)
![$\textbf{(D)}~134\text{ Ps, }132\text{ Qs, }134\text{ Rs}$](images/2023/f3fda82c0bddb3dcfb42a9dc36ce501a01abbfcd.png)
![$\textbf{(E)}~134\text{ Ps, }133\text{ Qs, }133\text{ Rs}$](images/2023/14369bbb6a00787b69dbbab2410124c130185a72.png)

---

## Problem 17

A
regular octahedron
has eight equilateral triangle faces with four faces meeting at each vertex. Jun will make the regular octahedron shown on the right by folding the piece of paper shown on the left. Which numbered face will end up to the right of
![$Q$](images/2023/9866e3a998d628ba0941eb4fea0666ac391d149a.png)
?
![[asy] // Diagram by TheMathGuyd import graph; // The Solid // To save processing time, do not use three (dimensions) // Project (roughly) to two size(15cm); pair Fr, Lf, Rt, Tp, Bt, Bk; Lf=(0,0); Rt=(12,1); Fr=(7,-1); Bk=(5,2); Tp=(6,6.7); Bt=(6,-5.2); draw(Lf--Fr--Rt); draw(Lf--Tp--Rt); draw(Lf--Bt--Rt); draw(Tp--Fr--Bt); draw(Lf--Bk--Rt,dashed); draw(Tp--Bk--Bt,dashed); label(rotate(-8.13010235)*slant(0.1)*"$Q$", (4.2,1.6)); label(rotate(21.8014095)*slant(-0.2)*"$?$", (8.5,2.05)); pair g = (-8,0); // Define Gap transform real a = 8; draw(g+(-a/2,1)--g+(a/2,1), Arrow()); // Make arrow // Time for the NET pair DA,DB,DC,CD,O; DA = (4*sqrt(3),0); DB = (2*sqrt(3),6); DC = (DA+DB)/3; CD = conj(DC); O=(0,0); transform trf=shift(3g+(0,3)); path NET = O--(-2*DA)--(-2DB)--(-DB)--(2DA-DB)--DB--O--DA--(DA-DB)--O--(-DB)--(-DA)--(-DA-DB)--(-DB); draw(trf*NET); label("$7$",trf*DC); label("$Q$",trf*DC+DA-DB); label("$5$",trf*DC-DB); label("$3$",trf*DC-DA-DB); label("$6$",trf*CD); label("$4$",trf*CD-DA); label("$2$",trf*CD-DA-DB); label("$1$",trf*CD-2DA); [/asy]](images/2023/73573481f96dd080a6118ceb2a3c4588148704dc.png)
![$\textbf{(A)}\ 1 \qquad \textbf{(B)}\ 2 \qquad \textbf{(C)}\ 3 \qquad \textbf{(D)}\ 4 \qquad \textbf{(E)}\ 5$](images/2023/d4de85cf3f5978446555260f2de6dbc927a7bfac.png)

---

## Problem 18

Greta Grasshopper sits on a long line of lily pads in a pond. From any lily pad, Greta can jump
![$5$](images/2023/79069377f91364c2f87a64e5f9f562a091c8a6c1.png)
pads to the right or
![$3$](images/2023/7cde695f2e4542fd01f860a89189f47a27143b66.png)
pads to the left. What is the fewest number of jumps Greta must make to reach the lily pad located
![$2023$](images/2023/0873e9fed23538e535ac05c3284b86bd7bce6fd6.png)
pads to the right of her starting point?
![$\textbf{(A)}\ 405 \qquad \textbf{(B)}\ 407 \qquad \textbf{(C)}\ 409 \qquad \textbf{(D)}\ 411 \qquad \textbf{(E)}\ 413$](images/2023/a473784da5b9eec4604b6f76407944e13e4b5a72.png)

---

## Problem 19

An equilateral triangle is placed inside a larger equilateral triangle so that the region between them can be divided into three congruent trapezoids, as shown below. The side length of the inner triangle is
![$\frac23$](images/2023/611d08a8c57a214b2b964bba16da8157a5b81c9a.png)
the side length of the larger triangle. What is the ratio of the area of one trapezoid to the area of the inner triangle?
![[asy] // Diagram by TheMathGuyd  pair A,B,C; A=(0,1); B=(sqrt(3)/2,-1/2); C=-conj(B); fill(2B--3B--3C--2C--cycle,grey); dot(3A); dot(3B); dot(3C); dot(2A); dot(2B); dot(2C); draw(2A--2B--2C--cycle); draw(3A--3B--3C--cycle); draw(2A--3A); draw(2B--3B); draw(2C--3C); [/asy]](images/2023/c5f0d710200d86f7fe0ffc7ea4226812f1de1cf8.png)
![$\textbf{(A) } 1 : 3 \qquad \textbf{(B) } 3 : 8 \qquad \textbf{(C) } 5 : 12 \qquad \textbf{(D) } 7 : 16 \qquad \textbf{(E) } 4 : 9$](images/2023/c7ed876e5e1b9f14af426a24ec0a937cf1feabb5.png)

---

## Problem 20

Two integers are inserted into the list
![$3,3,8,11,28$](images/2023/a7860596540d6246372611b4d96d9bf0b9e4ae7c.png)
to double its range. The mode and median remain unchanged. What is the maximum possible sum of the two additional numbers?
![$\textbf{(A)}\ 56 \qquad \textbf{(B)}\ 57 \qquad \textbf{(C)}\ 58 \qquad \textbf{(D)}\ 60 \qquad \textbf{(E)}\ 61$](images/2023/dabc406786fb587b5171edc8284d8d952976c149.png)

---

## Problem 21

Alina writes the numbers
![$1, 2, \dots , 9$](images/2023/99e5213f21f74a1eea064c29363fa047700e1f45.png)
on separate cards, one number per card. She wishes to divide the cards into
![$3$](images/2023/7cde695f2e4542fd01f860a89189f47a27143b66.png)
groups of
![$3$](images/2023/7cde695f2e4542fd01f860a89189f47a27143b66.png)
cards so that the sum of the numbers in each group will be the same. In how many ways can this be done?
![$\textbf{(A)}\ 0 \qquad \textbf{(B)}\ 1 \qquad \textbf{(C)}\ 2 \qquad \textbf{(D)}\ 3 \qquad \textbf{(E)}\ 4$](images/2023/0bcd5bbd626bd1e1ecd06b5e602defd55c570b1f.png)

---

## Problem 22

In a sequence of positive integers, each term after the second is the product of the previous two terms. The sixth term is
![$4000$](images/2023/0929ed034079c23455c385741744274c1f69b61b.png)
. What is the first term?
![$\textbf{(A)}\ 1 \qquad \textbf{(B)}\ 2 \qquad \textbf{(C)}\ 4 \qquad \textbf{(D)}\ 5 \qquad \textbf{(E)}\ 10$](images/2023/3bcafbd068b04d629843622091fe19086483f1f6.png)

---

## Problem 23

Each square in a
![$3 \times 3$](images/2023/d278803d72fcc493afb1559174a483aa7f41d143.png)
grid is randomly filled with one of the
![$4$](images/2023/c7cab1a05e1e0c1d51a6a219d96577a16b7abf9d.png)
gray and white tiles shown below on the right.
![[asy] size(5.663333333cm); draw((0,0)--(3,0)--(3,3)--(0,3)--cycle,gray); draw((1,0)--(1,3)--(2,3)--(2,0),gray); draw((0,1)--(3,1)--(3,2)--(0,2),gray);  fill((6,.33)--(7,.33)--(7,1.33)--cycle,mediumgray); draw((6,.33)--(7,.33)--(7,1.33)--(6,1.33)--cycle,gray); fill((6,1.67)--(7,2.67)--(6,2.67)--cycle,mediumgray); draw((6,1.67)--(7,1.67)--(7,2.67)--(6,2.67)--cycle,gray); fill((7.33,.33)--(8.33,.33)--(7.33,1.33)--cycle,mediumgray); draw((7.33,.33)--(8.33,.33)--(8.33,1.33)--(7.33,1.33)--cycle,gray); fill((8.33,1.67)--(8.33,2.67)--(7.33,2.67)--cycle,mediumgray); draw((7.33,1.67)--(8.33,1.67)--(8.33,2.67)--(7.33,2.67)--cycle,gray); [/asy]](images/2023/c01163352203e89b9926215ea00f34b275a6c630.png)
What is the probability that the tiling will contain a large gray diamond in one of the smaller
![$2 \times 2$](images/2023/e4c044326e2e84b768dafef07060bd42b0a5cb21.png)
grids? Below is an example of such tiling.
![[asy] size(2cm);  fill((1,0)--(0,1)--(0,2)--(1,1)--cycle,mediumgray); fill((2,0)--(3,1)--(2,2)--(1,1)--cycle,mediumgray); fill((1,2)--(1,3)--(0,3)--cycle,mediumgray); fill((1,2)--(2,2)--(2,3)--cycle,mediumgray); fill((3,2)--(3,3)--(2,3)--cycle,mediumgray);  draw((0,0)--(3,0)--(3,3)--(0,3)--cycle,gray); draw((1,0)--(1,3)--(2,3)--(2,0),gray); draw((0,1)--(3,1)--(3,2)--(0,2),gray); [/asy]](images/2023/8d9055c9c5a4feb6f71e870557f61ce1d6b5033a.png)
![$\textbf{(A) } \frac{1}{1024} \qquad \textbf{(B) } \frac{1}{256} \qquad \textbf{(C) } \frac{1}{64} \qquad \textbf{(D) } \frac{1}{16} \qquad \textbf{(E) } \frac{1}{4}$](images/2023/acc04643e80ab26da451b0c410ac5c7f8ffd6bad.png)

---

## Problem 24

Isosceles triangle
![$ABC$](images/2023/e2a559986ed5a0ffc5654bd367c29dfc92913c36.png)
has equal side lengths
![$AB$](images/2023/57ee5125358c0606c9b588580ddfa66f83e607b7.png)
and
![$BC$](images/2023/6c52a41dcbd739f1d026c5d4f181438b75b76976.png)
. In the figures below, segments are drawn parallel to
![$\overline{AC}$](images/2023/12517bbc31cb9026c71299b7a0d232d07e60f284.png)
so that the shaded portions of
![$\triangle ABC$](images/2023/8c3a2d2224f7d163b46d702132425d47828bf538.png)
have the same area. The heights of the two unshaded portions are 11 and 5 units, respectively. What is the height
![$h$](images/2023/8189a5b5a0917b8c93350827be4038af1839139d.png)
of
![$\triangle ABC$](images/2023/8c3a2d2224f7d163b46d702132425d47828bf538.png)
?
![[asy] //Diagram by TheMathGuyd size(12cm); real h = 2.5; // height real g=4; //c2c space real s = 0.65; //Xcord of Hline real adj = 0.08; //adjust line diffs pair A,B,C; B=(0,h); C=(1,0); A=-conj(C); pair PONE=(s,h*(1-s)); //Endpoint of Hline ONE pair PTWO=(s+adj,h*(1-s-adj)); //Endpoint of Hline ONE path LONE=PONE--(-conj(PONE)); //Hline ONE path LTWO=PTWO--(-conj(PTWO)); path T=A--B--C--cycle; //Triangle   fill (shift(g,0)*(LTWO--B--cycle),mediumgrey); fill (LONE--A--C--cycle,mediumgrey);  draw(LONE); draw(T); label("$A$",A,SW); label("$B$",B,N); label("$C$",C,SE);  draw(shift(g,0)*LTWO); draw(shift(g,0)*T); label("$A$",shift(g,0)*A,SW); label("$B$",shift(g,0)*B,N); label("$C$",shift(g,0)*C,SE);  draw(B--shift(g,0)*B,dashed); draw(C--shift(g,0)*A,dashed); draw((g/2,0)--(g/2,h),dashed); draw((0,h*(1-s))--B,dashed); draw((g,h*(1-s-adj))--(g,0),dashed); label("$5$", midpoint((g,h*(1-s-adj))--(g,0)),UnFill); label("$h$", midpoint((g/2,0)--(g/2,h)),UnFill); label("$11$", midpoint((0,h*(1-s))--B),UnFill); [/asy]](images/2023/61696b1f6c1847f1610683505bd7e902290c51da.png)
![$\textbf{(A)}\ 14.6 \qquad \textbf{(B)}\ 14.8 \qquad \textbf{(C)}\ 15 \qquad \textbf{(D)}\ 15.2 \qquad \textbf{(E)}\ 15.4$](images/2023/c4471a6384aa3e9510b2832ad457972190de1545.png)

---

## Problem 25

Fifteen integers
![$a_1, a_2, a_3, \dots, a_{15}$](images/2023/fe2da225200f3ec70146703c12fcb3dd73f60c96.png)
are arranged in order on a number line. The integers are equally spaced and have the property that
![\[1 \le a_1 \le 10, \thickspace 13 \le a_2 \le 20, \thickspace \text{ and } \thickspace 241 \le a_{15}\le 250.\]](images/2023/1d2ca926ca9cbd962c46878abaecad6ef507d5ff.png)
What is the sum of digits of
![$a_{14}?$](images/2023/64e86cfabffadcd5402b6b0a955b97e77ca678f0.png)
![$\textbf{(A)}\ 8 \qquad \textbf{(B)}\ 9 \qquad \textbf{(C)}\ 10 \qquad \textbf{(D)}\ 11 \qquad \textbf{(E)}\ 12$](images/2023/031bc749784013ca0e0bd575aebeed9a7928a569.png)

---

