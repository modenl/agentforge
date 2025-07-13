# AMC 8 2025 Problems

## Problem 1

The eight-pointed star, shown in the figure below, is a popular quilting pattern. What percent of the entire \(4\times4\) grid is covered by the star?
![[asy] path x = (0,1)--(1,2)--(2,2)--(1,1)--cycle; path y = reflect((0,0),(4,4)) * x;  fill(x, gray(0.6)); fill(rotate(90, (2,2)) * x, gray(0.6)); fill(rotate(180, (2,2)) * x, gray(0.6)); fill(rotate(270, (2,2)) * x, gray(0.6));  fill(y, gray(0.8)); fill(rotate(90, (2,2)) * y, gray(0.8)); fill(rotate(180, (2,2)) * y, gray(0.8)); fill(rotate(270, (2,2)) * y, gray(0.8));  draw((1,1)--(3,3)); draw((3,1)--(1,3));  add(grid(4,4));  path w = (1,0)--(2,1)--(3,0);  draw(w); draw(rotate(90, (2,2)) * w); draw(rotate(180, (2,2)) * w); draw(rotate(270, (2,2)) * w); [/asy]](images/2025/img_53877e85.png)
![$\textbf{(A)}\ 40 \qquad \textbf{(B)}\ 50 \qquad \textbf{(C)}\ 60 \qquad \textbf{(D)}\ 75 \qquad \textbf{(E)}\ 80$](images/2025/img_2d8d238e.png)

---

## Problem 2

The table below shows the Ancient Egyptian hieroglyphs that were used to represent different numbers.
![Mathh.PNG](https://wiki-images.artofproblemsolving.com//d/de/Mathh.PNG)
For example, the number
![$32$](images/2025/img_595ee3f0.png)
was represented by the hieroglyphs
![$\cap \cap \cap ||$](images/2025/img_03270b26.png)
. What number is represented by the following combination of hieroglyphs?
![Amc8 2025 prob 2 pic.PNG](images/2025/img_a9fede56.PNG)
![$\textbf{(A)}\ 1,423 \qquad \textbf{(B)}\ 10,423 \qquad \textbf{(C)}\ 14,023 \qquad \textbf{(D)}\ 14,203 \qquad \textbf{(E)}\ 14,230$](images/2025/img_9e5bb0dd.png)

---

## Problem 3

Buffalo Shuffle-o
is a card game in which all the cards are distributed evenly among all players at the start of the game. When Annika and
![$3$](images/2025/img_1f320089.png)
of her friends play
Buffalo Shuffle-o
, each player is dealt
![$15$](images/2025/img_6c600a7e.png)
cards. Suppose
![$2$](images/2025/img_2152dc9b.png)
more friends join the next game. How many cards will be dealt to each player?
![$\textbf{(A)}\ 8 \qquad \textbf{(B)}\ 9 \qquad \textbf{(C)}\ 10 \qquad \textbf{(D)}\ 11 \qquad \textbf{(E)}\ 12$](images/2025/img_2c8da909.png)

---

## Problem 4

Lucius is counting backward by
![$7$](images/2025/img_9ed45e2d.png)
s. His first three numbers are
![$100$](images/2025/img_96c44040.png)
,
![$93$](images/2025/img_75337eff.png)
, and
![$86$](images/2025/img_8d0174df.png)
. What is his
![$10$](images/2025/img_f79d0167.png)
th number?
![$\textbf{(A)}\ 30 \qquad \textbf{(B)}\ 37 \qquad \textbf{(C)}\ 42 \qquad \textbf{(D)}\ 44 \qquad \textbf{(E)}\ 47$](images/2025/img_d8203adc.png)

---

## Problem 5

Betty drives a truck to deliver packages in a neighborhood whose street map is shown below.
Betty starts at the factory (labled
![$F$](images/2025/img_655b1bd8.png)
) and drives to location
![$A$](images/2025/img_34a24da9.png)
, then
![$B$](images/2025/img_51426edd.png)
, then
![$C$](images/2025/img_a40fb99d.png)
, before returning to
![$F$](images/2025/img_655b1bd8.png)
. What is the shortest distance, in blocks, she can drive to complete the route?
![[asy]  unitsize(20);  add(grid(8,6));  path w = circle((0,0),0.4);  fill(w, white); draw(w); label("$B$",(0,0));  fill(shift((2,4)) * w, white); draw(shift((2,4)) * w); label("$C$",(2,4));  fill(shift((7,3)) * w, white); draw(shift((7,3)) * w); label("$A$",(7,3));  fill(shift((6,5)) * w, white); draw(shift((6,5)) * w); label("$F$",(6,5));  draw((6,-0.2)--(7,-0.2), EndArrow(3)); draw((7,-0.2)--(6,-0.2), EndArrow(3)); draw(shift(6.5, -0.48) * scale(0.03) * texpath("1 block"));  draw((8.2,1)--(8.2,2), EndArrow(3)); draw((8.2,2)--(8.2,1), EndArrow(3)); draw(shift(8.88, 1.5) * scale(0.03) * texpath("1 block"));  [/asy]](images/2025/img_bd9012ed.png)
![$\textbf{(A)}\ 20 \qquad \textbf{(B)}\ 22 \qquad \textbf{(C)}\ 24 \qquad \textbf{(D)}\ 26\qquad \textbf{(E)}\ 28$](images/2025/img_958a4899.png)

---

## Problem 6

Sekou writes the numbers
![$15, 16, 17, 18, 19.$](images/2025/img_caf34e28.png)
After he erases one of his numbers, the sum of the remaining four numbers is a multiple of
![$4.$](images/2025/img_8a2c2bd8.png)
Which number did he erase?
![$\textbf{(A)}\ 15\qquad \textbf{(B)}\ 16\qquad \textbf{(C)}\ 17\qquad \textbf{(D)}\ 18\qquad \textbf{(E)}\ 19$](images/2025/img_07b1482e.png)

---

## Problem 7

On the most recent exam on Prof. Xochi's class,
![$5$](images/2025/img_e14a7d54.png)
students earned a score of at least
![$95\%$](images/2025/img_77942bbb.png)
![$13$](images/2025/img_040cbe46.png)
students earned a score of at least
![$90\%$](images/2025/img_a8fa3fca.png)
![$27$](images/2025/img_54037f75.png)
students earned a score of at least
![$85\%$](images/2025/img_9dc1079e.png)
![$50$](images/2025/img_0732c92b.png)
students earned a score of at least
![$80\%$](images/2025/img_305b1360.png)
How many students earned a score of at least
![$80\%$](images/2025/img_305b1360.png)
and less than
![$90\%$](images/2025/img_a8fa3fca.png)
?
![$\textbf{(A)}\ 8\qquad \textbf{(B)}\ 14\qquad \textbf{(C)}\ 22\qquad \textbf{(D)}\ 37\qquad \textbf{(E)}\ 45$](images/2025/img_70e197e4.png)

---

## Problem 8

Isaiah cuts open a cardboard cube along some of its edges to form the flat shape shown on the right, which has an area of
![$18$](images/2025/img_e947e7e2.png)
square centimeters. What is the volume of the cube in cubic centimeters?
![Amc8 2025 prob8.PNG](images/2025/img_28d7429a.PNG)
![$\textbf{(A)}~3\sqrt{3}\qquad\textbf{(B)}~6\qquad\textbf{(C)}~9\qquad\textbf{(D)}~6\sqrt{3}\qquad\textbf{(E)}~9\sqrt{3}$](images/2025/img_b709bcdd.png)

---

## Problem 9

Ningli looks at the
![$6$](images/2025/img_9c13e64a.png)
pairs of numbers directly across from each other on a clock. She takes the average of each pair of numbers. What is the average of the resulting
![$6$](images/2025/img_9c13e64a.png)
numbers?
![[asy] /* AMC8 P9 2025, by NUMANA: BUI VAN HIEU buivanhieu@husc.edu.vn, https://husc.edu.vn */ unitsize(1cm); draw(circle((0,0),2));  for(int i = 1; i <= 12; ++i) { draw(1.9*dir(90-i*30)-- 2*dir(90-i*30));//,linewidth(1pt) label("$"+string(i)+"$",2.3*dir(90-i*30)); }  draw(2*dir(-150)--2*dir(30),dashed); [/asy]](images/2025/img_216d2598.png)
![$\textbf{(A)}\ 5\qquad \textbf{(B)}\ 6.5\qquad \textbf{(C)}\ 8\qquad \textbf{(D)}\ 9.5 \qquad \textbf{(E)}\ 12$](images/2025/img_03bf5be1.png)

---

## Problem 10

In the figure below,
![$ABCD$](images/2025/img_52239528.png)
is a rectangle with sides of length
![$AB = 5$](images/2025/img_fbb21bc5.png)
inches and
![$AD$](images/2025/img_e012a4a8.png)
=
![$3$](images/2025/img_1f320089.png)
inches. Rectangle
![$ABCD$](images/2025/img_52239528.png)
is rotated
![$90^\circ$](images/2025/img_bbeeeea5.png)
clockwise around the midpoint of side
![$DC$](images/2025/img_9fe9aed1.png)
to give a second rectangle. What is the total area, in square inches, covered by the two overlapping rectangles?
![[asy] /* 2025 AMC 8 Problem 10 Diagram */ unitsize(1cm);  pair A = (-2.5,1.5), B = (2.5,1.5), C = (2.5,-1.5), D = (-2.5,-1.5); filldraw(A--B--C--D--cycle, gray(0.8), black+1bp); label("$A$", A, NW); label("$B$", B, NE); label("$C$", C, SE); label("$D$", D, SW);  pair P = (3,1), Q = (3,-4), R = (0,-4), S = (0,1);  draw(P--Q--R--S--cycle, black+1bp);  pair M = (0,-1.5); dot(M, black+5bp);  draw(arc((0,-1.5), 0.3, 180, -90), Arrow(TeXHead)); [/asy]](images/2025/img_834512bd.png)
![$\textbf{(A)}\ 21 \qquad \textbf{(B)}\ 22.25 \qquad \textbf{(C)}\ 23 \qquad \textbf{(D)}\ 23.75 \qquad \textbf{(E)}\ 25$](images/2025/img_d4e05d98.png)

---

## Problem 11

A
![$\textit{tetromino}$](images/2025/img_f78878ee.png)
consists of four squares connected along their edges. There are five possible tetromino shapes,
![$I$](images/2025/img_8e0793ac.png)
,
![$O$](images/2025/img_5510539d.png)
,
![$L$](images/2025/img_02d7df88.png)
,
![$T$](images/2025/img_73f3fc42.png)
, and
![$S$](images/2025/img_f132a1c1.png)
, shown below, which can be rotated or flipped over. Three tetrominoes are used to completely cover a
![$3\times4$](images/2025/img_11e29f56.png)
rectangle. At least one of the tiles is an
![$S$](images/2025/img_f132a1c1.png)
tile. What are the other two tiles?
![[asy]  unitsize(12);  add(grid(1,4)); label("I", (0.5,-1));  add(shift((5,0)) * grid(2,2)); label("O", (6,-1));  add(shift((11,0)) * grid(1,3)); add(shift((11,0)) * grid(2,1)); label("L", (12,-1));  add(shift((18,0)) * grid(1,1)); add(shift((17,1)) * grid(3,1)); label("T", (18.5,-1));  add(shift((25,1)) * grid(2,1)); add(shift((24,0)) * grid(2,1)); label("S", (25.5,-1));  add(shift((12,-6)) * grid(4,3));  [/asy]](images/2025/img_426546ed.png)
![$\textbf{(A)}I$](images/2025/img_4cbf268d.png)
and
![$L\qquad \textbf{(B)} I$](images/2025/img_190db652.png)
and
![$T\qquad \textbf{(C)} L$](images/2025/img_9666444d.png)
and
![$L\qquad \textbf{(D)}L$](images/2025/img_f30f9899.png)
and
![$S\qquad \textbf{(E)}O$](images/2025/img_a32c5ab7.png)
and
![$T$](images/2025/img_73f3fc42.png)

---

## Problem 12

The region shown below consists of 24 squares, each with side length 1 centimeter. What is the area, in square centimeters, of the largest circle that can fit inside the region, possibly touching the boundaries?
![[asy] import graph;  size(100);  pen gridPen = black;  void drawSquare(pair p) {     draw(box(p, p + (1,1)), gridPen); }  int[][] grid = {     {0, 0, 0, 0, 0, 0},     {0, 0, 1, 1, 0, 0},     {0, 1, 1, 1, 1, 0},     {1, 1, 1, 1, 1, 1},     {1, 1, 1, 1, 1, 1},     {0, 1, 1, 1, 1, 0},     {0, 0, 1, 1, 0, 0},     {0, 0, 0, 0, 0, 0} };  int rows = grid.length; int cols = grid[0].length;  for (int i = 0; i < rows; ++i) {     for (int j = 0; j < cols; ++j) {         if (grid[i][j] == 1) {             drawSquare((j, rows - i - 1));         }     } } [/asy]](images/2025/img_0992e8be.png)
![$\textbf{(A)}\ 3\pi\qquad \textbf{(B)}\ 4\pi\qquad \textbf{(C)}\ 5\pi\qquad \textbf{(D)}\ 6\pi\qquad \textbf{(E)}\ 8\pi$](images/2025/img_806c103a.png)

---

## Problem 13

*Problem not found*

---

## Problem 14

A number
![$N$](images/2025/img_cf5afc7e.png)
is inserted into the list
![$2, 6, 7, 7, 28$](images/2025/img_9eaeb323.png)
. The mean is now twice as great as the median. What is
![$N$](images/2025/img_cf5afc7e.png)
?
![$\textbf{(A)}\ 7\qquad \textbf{(B)}\ 14\qquad \textbf{(C)}\ 20\qquad \textbf{(D)}\ 28\qquad \textbf{(E)}\ 34$](images/2025/img_7d7ee706.png)

---

## Problem 15

Kei draws a
![$6$](images/2025/img_9c13e64a.png)
-by-
![$6$](images/2025/img_9c13e64a.png)
grid. He colors
![$13$](images/2025/img_040cbe46.png)
of the unit squares silver and the remaining squares gold. Kei then folds the grid in half vertically, forming pairs of overlapping unit squares. Let
![$m$](images/2025/img_9242a259.png)
and
![$M$](images/2025/img_777d8d4e.png)
equal the least and greatest possible number of gold-on-gold pairs, respectively. What is the value of
![$m+M$](images/2025/img_1e663aef.png)
?
![[asy] import graph;  size(100);  pen gridPen = black;  void drawSquare(pair p) {     draw(box(p, p + (1,1)), gridPen); }  int[][] grid = {     {1, 1, 1, 1, 1, 1},     {1, 1, 1, 1, 1, 1},     {1, 1, 1, 1, 1, 1},     {1, 1, 1, 1, 1, 1},     {1, 1, 1, 1, 1, 1},     {1, 1, 1, 1, 1, 1},  };  int rows = grid.length; int cols = grid[0].length;  for (int i = 0; i < rows; ++i) {     for (int j = 0; j < cols; ++j) {         if (grid[i][j] == 1) {             drawSquare((j, rows - i - 1));         }     } } [/asy]](images/2025/img_c6d4458e.png)
![$\textbf{(A)}\ 12\qquad \textbf{(B)}\ 14\qquad \textbf{(C)}\ 16\qquad \textbf{(D)}\ 18 \qquad \textbf{(E)}\ 20$](images/2025/img_75785c62.png)

---

## Problem 16

Five distinct integers from
![$1$](images/2025/img_2254f7b9.png)
to
![$10$](images/2025/img_f79d0167.png)
are chosen, and five distinct integers from
![$11$](images/2025/img_30c571da.png)
to
![$20$](images/2025/img_aa03a002.png)
are chosen. No two numbers differ by exactly
![$10$](images/2025/img_f79d0167.png)
. What is the sum of the ten chosen numbers?
![$\textbf{(A)}\ 95\qquad \textbf{(B)}\ 100\qquad \textbf{(C)}\ 105\qquad \textbf{(D)}\ 110\qquad \textbf{(E)}\ 115$](images/2025/img_09b6c9ab.png)

---

## Problem 17

In the land of Markovia, there are three cities:
![$A$](images/2025/img_34a24da9.png)
,
![$B$](images/2025/img_51426edd.png)
, and
![$C$](images/2025/img_a40fb99d.png)
. There are
![$100$](images/2025/img_96c44040.png)
people who live in
![$A$](images/2025/img_34a24da9.png)
,
![$120$](images/2025/img_80197e3b.png)
who live in
![$B$](images/2025/img_51426edd.png)
, and
![$160$](images/2025/img_faf9ee07.png)
who live in
![$C$](images/2025/img_a40fb99d.png)
. Everyone works in one of the three cities, and a person may work in the same city where they live. In the figure below, an arrow pointing from one city to another is labeled with the fraction of people living in the first city who work in the second city. (For example,
![$\frac{1}{4}$](images/2025/img_ec23b772.png)
of the people who live in
![$A$](images/2025/img_34a24da9.png)
work in
![$B$](images/2025/img_51426edd.png)
.) How many people work in
![$A$](images/2025/img_34a24da9.png)
?
![[asy] // AMC8 P17 2025, by NUMANA import graph; unitsize(2cm); real r=0.15; pair A, B, C;B = (0,0);C = (2,0);A = (1,sqrt(3)); // Drawing the nodes draw(circle(A,r)); label("$A$", A); draw(circle(B,r)); label("$B$", B); draw(circle(C,r)); label("$C$", C);  guide AB=A+r*dir(-135)..{down}B+r*dir(90),	  	  BA=B+r*dir(60)..{up}A+r*dir(-105),    	  BC=B+r*dir(0)..(1,-0.2)..C+r*dir(180),   		              CB=C+r*dir(150)..(1,0.3)..B+r*dir(30),  	  CA=C+r*dir(90){up}..A+r*dir(-45),     	  AC=A+r*dir(-75){down}..C+r*dir(120);        draw(AB,L=Label("$1/4$", MidPoint, W),Arrow(HookHead));draw(BA,L=Label("$1/3$", MidPoint, W),Arrow(HookHead));draw(BC,L=Label("$1/6$", MidPoint, S),Arrow(HookHead));draw(CB,L=Label("$1/10$", MidPoint, S),Arrow(HookHead)); draw(CA,L=Label("$1/8$", MidPoint, E),Arrow(HookHead));draw(AC,L=Label("$1/5$", MidPoint, E),Arrow(HookHead)); [/asy]](images/2025/img_619bd7db.png)
![$\textbf{(A)}\ 55\qquad \textbf{(B)}\ 60\qquad \textbf{(C)}\ 85\qquad \textbf{(D)}\ 115\qquad \textbf{(E)}\ 160$](images/2025/img_7ab54bb2.png)

---

## Problem 18

The circle shown below on the left has a radius of 1 unit. The region between the circle and the inscribed square is shaded. In the circle shown on the right, one quarter of the region between the circle and the inscribed square is shaded. The shaded regions in the two circles have the same area. What is the radius
![$R$](images/2025/img_add6cfce.png)
, in units, of the circle on the right?
![[asy]  unitsize(40);  real a = 0.707;  fill(circle((a,a), 1), grey); fill((0,0)--(0,1.414)--(1.414,1.414)--(1.414,0)--cycle, white); draw((0,0)--(0,1.414)--(1.414,1.414)--(1.414,0)--cycle); draw(circle((a,a), 1));  draw((0.707,0.707)--(1.414,1.414)); dot((0.707,0.707)); label("$1$", (1,1), SE);    fill(circle((4+a, a), 2*a), grey); fill(shift((4+a,a)) * ((-2,-2)--(1,-2)--(1,2)--(-2,2)--cycle), white); draw(shift((4+a,a)) * ((-1,-1)--(1,-1)--(1,1)--(-1,1)--cycle)); draw(circle((4+a, a), 2*a));  draw((4+a,a)--(5+a,1+a)); dot((4+a,a)); label("$R$", (a+4.5,a+0.5), SE);  [/asy]](images/2025/img_091c9fe0.png)
![$\textbf{(A)}\ \sqrt2\qquad \textbf{(B)}\ 2\qquad \textbf{(C)}\ 2\sqrt2\qquad \textbf{(D)}\ 4\qquad \textbf{(E)}\ 4\sqrt2$](images/2025/img_e619e2aa.png)

---

## Problem 19

Two towns,
![$A$](images/2025/img_34a24da9.png)
and
![$B$](images/2025/img_51426edd.png)
, are connected by a straight road,
![$15$](images/2025/img_6c600a7e.png)
miles long. Traveling from town
![$A$](images/2025/img_34a24da9.png)
to town
![$B$](images/2025/img_51426edd.png)
, the speed limit changes every
![$5$](images/2025/img_e14a7d54.png)
miles: from
![$25$](images/2025/img_231e9d4e.png)
to
![$40$](images/2025/img_938c4705.png)
to
![$20$](images/2025/img_aa03a002.png)
miles per hour (mph). Two cars, one at town
![$A$](images/2025/img_34a24da9.png)
and one at town
![$B$](images/2025/img_51426edd.png)
, start moving toward each other at the same time. They drive at exactly the speed limit in each portion of the road. How far from town
![$A$](images/2025/img_34a24da9.png)
, in miles, will the two cars meet?
![[asy] // Asymptote code by aoum size(10cm); real h = 0.1; real s = 0.07; path b = brace((1,0),(0,0),amplitude=s); filldraw((0,0)--(3,0)--(3,h)--(0,h)--cycle,lightgray,black+1bp); draw((1,0)--(1,h),dashed); draw((2,0)--(2,h),dashed); label("$A$",(0,h/2),W); label("$B$",(3,h/2),E); draw(scale(0.7)*"$25\,\textrm{mph}$",(1,h+s)--(0,h+s),Bars); draw(scale(0.7)*"$40\,\textrm{mph}$",(2,h+s)--(1,h+s),Bars); draw(scale(0.7)*"$20\,\textrm{mph}$",(3,h+s)--(2,h+s),Bars); draw(b);  draw(shift(1,0)*b);  draw(shift(2,0)*b); label(scale(0.7)*"$5\,\textrm{mi}$",(0.5,-s),S); label(scale(0.7)*"$5\,\textrm{mi}$",(1.5,-s),S); label(scale(0.7)*"$5\,\textrm{mi}$",(2.5,-s),S); [/asy]](images/2025/img_550aa1cb.png)
![$\textbf{(A)}\ 7.75\qquad \textbf{(B)}\ 8\qquad \textbf{(C)}\ 8.25\qquad \textbf{(D)}\ 8.5\qquad \textbf{(E)}\ 8.75$](images/2025/img_5e44418a.png)

---

## Problem 20

Sarika, Dev, and Rajiv are sharing a large block of cheese. They take turns cutting off half of what
remains and eating it: first Sarika eats half of the cheese, then Dev eats half of the remaining half,
then Rajiv eats half of what remains, then back to Sarika, and so on. They stop when the cheese is
too small to see. About what fraction of the original block of cheese does Sarika eat in total?
![$\textbf{(A)}\ \frac{4}{7}\qquad \textbf{(B)}\ \frac{3}{5}\qquad \textbf{(C)}\ \frac{2}{3}\qquad \textbf{(D)}\ \frac{3}{4}\qquad \textbf{(E)}\ \frac{7}{8}$](images/2025/img_6fb5f49c.png)

---

## Problem 21

The Konigsberg School has assigned grades 1 through 7 to pods
![$A$](images/2025/img_34a24da9.png)
through
![$G$](images/2025/img_36745575.png)
, one grade per
pod. Some of the pods are connected by walkways, as shown in the figure below. The school
noticed that each pair of connected pods has been assigned grades differing by 2 or more grade
levels. (For example, grades 1 and 2 will not be in pods directly connected by a walkway.) What is
the sum of the grade levels assigned to pods
![$C, E$](images/2025/img_f8ca38f4.png)
, and
![$F$](images/2025/img_655b1bd8.png)
?
![[asy] // Asymptote by aoum size(6cm);  void walkway(path w) {   draw(w,black+3bp);   draw(w,white+2bp); }  void pod(pair P, string s, pen p=white) {   path box = scale(.2)*((-1,-1)--(-1,1)--(1,1)--(1,-1)--cycle);   filldraw(shift(P)*box,p,black);   label("$"+s+"$",P); }  pair A,B,C,D,E,F,G; C = (0.5,0); A = (1.5,2); B = (2,1); D = (2.5,0); E = (4,-0.5); F = (4.5,1); G = (3.5,2);  walkway(A--B);  walkway(B--C); walkway(A..(A+C)/2+(-.5,.5)..C); walkway(C--D); walkway(D--E); walkway(C..(C+E)/2+(-.2,-.5)..E); walkway(B--F); walkway(C--F); walkway(E..(E+F)/2+(.2,-.1)..F); walkway(A--F); walkway(A--G); walkway(G..(G+F)/2+(.2,.2)..F);  pod(A,"A");  pod(B,"B");  pod(C,"C",lightgray);  pod(D,"D"); pod(E,"E",lightgray);  pod(F,"F",lightgray);  pod(G,"G"); [/asy]](images/2025/img_e5cb5988.png)
![$\textbf{(A)}~12\qquad\textbf{(B)}~13\qquad\textbf{(C)}~14\qquad\textbf{(D)}~15\qquad\textbf{(E)}~16$](images/2025/img_a06413ad.png)

---

## Problem 22

A classroom has a row of 35 coat hooks. Paulina likes coats to be equally spaced, so that there is the same number of empty hooks before the first coat, after the last coat, and between every coat and the next one. Suppose there is at least 1 coat and at least 1 empty hook. How many different numbers of coats can satisfy Paulina's pattern?
![$\textbf{(A)}\ 2\qquad \textbf{(B)}\ 4\qquad \textbf{(C)}\ 5\qquad \textbf{(D)}\ 7\qquad \textbf{(E)}\ 9$](images/2025/img_cc771e77.png)

---

## Problem 23

How many four-digit numbers have all three of the following properties?
(I) The tens and ones digit are both 9.
(II) The number is 1 less than a perfect square.
(III) The number is the product of exactly two prime numbers.
![$\textbf{(A)}\ 0 \qquad \textbf{(B)}\ 1 \qquad \textbf{(C)}\ 2 \qquad \textbf{(D)}\ 3 \qquad \textbf{(E)}\ 4$](images/2025/img_2931319d.png)

---

## Problem 24

In trapezoid
![$ABCD$](images/2025/img_52239528.png)
, angles
![$B$](images/2025/img_51426edd.png)
and
![$C$](images/2025/img_a40fb99d.png)
measure
![$60^\circ$](images/2025/img_a0eb87cf.png)
and
![$AB = DC$](images/2025/img_6e770e1a.png)
. The side lengths are all positive integers, and the perimeter of
![$ABCD$](images/2025/img_52239528.png)
is
![$30$](images/2025/img_d6a4f9fd.png)
units. How many non-congruent trapezoids satisfy all of these conditions?
![[asy] // Asymptote by aoum import olympiad; size(7cm);  pair A,B,C,D; A = (-1,2); B = (-2,0); C = (2,0); D = (1,2);  draw(A--B--C--D--cycle);  label("$A$", A, NW); label("$B$", B, SW); label("$C$", C, SE); label("$D$", D, NE);  draw(anglemark(B,A,D,t=6)); draw(anglemark(A,D,C,t=6));  label(scale(0.8)*"$60^\circ$", B, NE + 0.5E); label(scale(0.8)*"$60^\circ$", C, NW + 0.5W);  add(pathticks(A--B)); add(pathticks(D--C)); [/asy]](images/2025/img_9b4f243a.png)
![$\textbf{(A)}\ 0 \qquad \textbf{(B)}\ 1 \qquad \textbf{(C)}\ 2 \qquad \textbf{(D)}\ 3 \qquad \textbf{(E)}\ 4$](images/2025/img_2931319d.png)

---

## Problem 25

Makayla finds all the possible ways to draw a path in a
![$5 \times 5$](images/2025/img_d98c098d.png)
diamond-shaped grid. Each path starts at the bottom of the grid and ends at the top, always moving one unit northeast or northwest. She computes the area of the region between each path and the right side of the grid. Two examples are shown in the figures below. What is the sum of the areas determined by all possible paths?
![[asy] // Asymptote by aoum unitsize(5mm);  path createpath(pair[][] P, int[] p) {   int i=0;   int j=0;   path dp = P[0][0];   for (int s=0; s<10; ++s) {     if (p[s] == 0) {++i;} else {++j;}     dp = dp--P[i][j];   }   return(dp); }  pair A[][], B[][]; for (int i=0; i<6; ++i) {   A[i] = new pair[];   B[i] = new pair[];   for (int j=0; j<6; ++j) {     A[i].push(rotate(45)*(i,j));     B[i].push(shift(9,0)*A[i][j]);   } }  int[] p = {0,0,1,1,1,0,0,1,1,0}; path pA = createpath(A,p);  int[] q = {1,0,0,0,1,1,1,1,0,0}; path qB = createpath(B,q);  fill(pA--A[5][0]--cycle,lightgray); fill(qB--B[5][0]--cycle,lightgray);  for (int i=0; i<6; ++i) {   draw(A[i][0]--A[i][5],gray);   draw(B[i][0]--B[i][5],gray);   draw(A[0][i]--A[5][i],gray);   draw(B[0][i]--B[5][i],gray); }  draw(pA,black+2bp); draw(qB,black+2bp);  dot(A[0][0],black+5bp); dot(A[5][5],black+5bp); dot(B[0][0],black+5bp); dot(B[5][5],black+5bp);  label("$\mathrm{area} = 11$", A[0][0], S); label("$\mathrm{area} = 13$", B[0][0], S); [/asy]](images/2025/img_2ba5f770.png)
![$\textbf{(A)}\ 2520 \qquad \textbf{(B)}\ 3150 \qquad \textbf{(C)}\ 3840 \qquad \textbf{(D)}\ 4730 \qquad \textbf{(E)}\ 5050$](images/2025/img_a56edfd3.png)

---

