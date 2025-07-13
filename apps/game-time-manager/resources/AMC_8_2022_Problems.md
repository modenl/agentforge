# AMC 8 2022 Problems

## Problem 1

The Math Team designed a logo shaped like a multiplication symbol, shown below on a grid of 1-inch squares. What is the area of the logo in square inches?
![[asy] defaultpen(linewidth(0.5)); size(5cm); defaultpen(fontsize(14pt)); label("$\textbf{Math}$", (2.1,3.7)--(3.9,3.7)); label("$\textbf{Team}$", (2.1,3)--(3.9,3)); filldraw((1,2)--(2,1)--(3,2)--(4,1)--(5,2)--(4,3)--(5,4)--(4,5)--(3,4)--(2,5)--(1,4)--(2,3)--(1,2)--cycle, mediumgray*0.5 + lightgray*0.5);  draw((0,0)--(6,0), gray); draw((0,1)--(6,1), gray); draw((0,2)--(6,2), gray); draw((0,3)--(6,3), gray); draw((0,4)--(6,4), gray); draw((0,5)--(6,5), gray); draw((0,6)--(6,6), gray);  draw((0,0)--(0,6), gray); draw((1,0)--(1,6), gray); draw((2,0)--(2,6), gray); draw((3,0)--(3,6), gray); draw((4,0)--(4,6), gray); draw((5,0)--(5,6), gray); draw((6,0)--(6,6), gray); [/asy]](images/2022/fd9026b556ba0538a3fa5fcbceab37f93ade3d4c.png)
![$\textbf{(A) } 10 \qquad \textbf{(B) } 12 \qquad \textbf{(C) } 13 \qquad \textbf{(D) } 14 \qquad \textbf{(E) } 15$](images/2022/357ed32a5299d19e0065c66a332351889b71999b.png)

---

## Problem 2

Consider these two operations:
![\begin{align*} a \, \blacklozenge \, b &= a^2 - b^2\\ a \, \bigstar \, b &= (a - b)^2 \end{align*}](images/2022/a9f3ce0b7f20284ad5a40b223ba9a60ae809247b.png)
What is the value of
![$(5 \, \blacklozenge \, 3) \, \bigstar \, 6?$](images/2022/332a49dd35236a9c3386b18cd7cb45aedaba2cbb.png)
![$\textbf{(A) } {-}20 \qquad \textbf{(B) } 4 \qquad \textbf{(C) } 16 \qquad \textbf{(D) } 100 \qquad \textbf{(E) } 220$](images/2022/f0269d39b24cefc58e71b59eecd515d36238b623.png)

---

## Problem 3

When three positive integers
![$a$](images/2022/c7d457e388298246adb06c587bccd419ea67f7e8.png)
,
![$b$](images/2022/8136a7ef6a03334a7246df9097e5bcc31ba33fd2.png)
, and
![$c$](images/2022/3372c1cb6d68cf97c2d231acc0b47b95a9ed04cc.png)
are multiplied together, their product is
![$100$](images/2022/e59e2c6e83eb78cca610a5fd4070ae01c8d4ae60.png)
. Suppose
![$a < b < c$](images/2022/7c286a6b2750b9c5c514b55b7f52660b1f66c21f.png)
. In how many ways can the numbers be chosen?
![$\textbf{(A) } 0 \qquad \textbf{(B) } 1\qquad\textbf{(C) } 2\qquad\textbf{(D) } 3\qquad\textbf{(E) } 4$](images/2022/ed2c77bc9ef456c844333af7896c95b0e116a964.png)

---

## Problem 4

The letter
M
in the figure below is first reflected over the line
![$q$](images/2022/0615acc3725de21025457e7d6f7694dab8e2f758.png)
and then reflected over the line
![$p$](images/2022/36f73fc1312ee0349b3f3a0f3bd9eb5504339011.png)
. What is the resulting image?
![[asy] // pog diagram usepackage("newtxtext"); size(3cm); draw((-1,0)--(1,0)); draw((0,-1)--(0,1)); label("$\textbf{\textsf{M}}$",(0.25,0.6)); draw((-0.8,-0.8)--(0.8,0.8),linewidth(1.1)); label("$p$", (-1,0),NE); label("$q$", (-0.75,-0.75), N*1.5); [/asy]](images/2022/c38b67d113d5fbf1b6d6eae0d87161b539dbd849.png)
![[asy] // pog diagram usepackage("newtxtext"); size(12.5cm); draw((-1,0)--(1,0)); draw((0,-1)--(0,1)); label(rotate(90)*"$\textbf{\textsf{M}}$",(0.6,-0.25)); draw((-0.8,-0.8)--(0.8,0.8),linewidth(1.1));  label("$\textbf{(A)}$",(-1,1),W); draw((2,0)--(4,0)); draw((3,-1)--(3,1)); label(rotate(270)*"$\textbf{\textsf{M}}$",(2.8,0.7)); draw((2.2,-0.8)--(3.8,0.8),linewidth(1.1));  label("$\textbf{(B)}$",(2,1),W); draw((5,0)--(7,0)); draw((6,-1)--(6,1)); label(rotate(90)*"$\textbf{\textsf{M}}$",(5.4,0.2)); draw((5.2,-0.8)--(6.8,0.8),linewidth(1.1));  label("$\textbf{(C)}$",(5,1),W); draw((-1,-2.5)--(1,-2.5)); draw((0,-3.5)--(0,-1.5)); label(rotate(180)*"$\textbf{\textsf{M}}$",(-0.25,-3.1)); draw((-0.8,-3.3)--(0.8,-1.7),linewidth(1.1));  label("$\textbf{(D)}$",(-1,-1.5),W); draw((2,-2.5)--(4,-2.5)); draw((3,-3.5)--(3,-1.5)); label(rotate(270)*"$\textbf{\textsf{M}}$",(3.6,-2.75)); draw((2.2,-3.3)--(3.8,-1.7),linewidth(1.1));  label("$\textbf{(E)}$",(2,-1.5),W); [/asy]](images/2022/19b58c8f6aafe00e0ad5454583fda04c3567f944.png)

---

## Problem 5

Anna and Bella are celebrating their birthdays together. Five years ago, when Bella turned
![$6$](images/2022/601a7806cbfad68196c43a4665871f8c3186802e.png)
years old, she received a newborn kitten as a birthday present. Today the sum of the ages of the two children and the kitten is
![$30$](images/2022/651ba418a810d971dbc8a326d49a71fe1541fae0.png)
years. How many years older than Bella is Anna?
![$\textbf{(A) } 1 \qquad \textbf{(B) } 2 \qquad \textbf{(C) } 3 \qquad \textbf{(D) } 4 \qquad \textbf{(E) } ~5$](images/2022/3d7a5655f0f7e386f064140fa9dc877302b3a28a.png)

---

## Problem 6

Three positive integers are equally spaced on a number line. The middle number is
![$15,$](images/2022/62b477ff41e1b4c1050d4dd41bcea08de66eb9eb.png)
and the largest number is
![$4$](images/2022/c7cab1a05e1e0c1d51a6a219d96577a16b7abf9d.png)
times the smallest number. What is the smallest of these three numbers?
![$\textbf{(A) } 4 \qquad \textbf{(B) } 5 \qquad \textbf{(C) } 6 \qquad \textbf{(D) } 7 \qquad \textbf{(E) } 8$](images/2022/4f46b794dab70132f52da80dfa08f422e8d05b4d.png)

---

## Problem 7

When the World Wide Web first became popular in the
![$1990$](images/2022/58f36e07c777841be994760a71f76fb3acac7e50.png)
s, download speeds reached a maximum of about
![$56$](images/2022/6392be3c4d257afbc7ed9283bdb8ba630f4ef7e1.png)
kilobits per second. Approximately how many minutes would the download of a
![$4.2$](images/2022/55cd5096fdf88f4158d342806f650704472f9a96.png)
-megabyte song have taken at that speed? (Note that there are
![$8000$](images/2022/5a7d4eb637d47b95bbf234703443464f33712ee9.png)
kilobits in a megabyte.)
![$\textbf{(A) } 0.6 \qquad \textbf{(B) } 10 \qquad \textbf{(C) } 1800 \qquad \textbf{(D) } 7200 \qquad \textbf{(E) } 36000$](images/2022/383a4159ca4adf29293288b9edc061c9a2a10a0a.png)

---

## Problem 8

What is the value of
![\[\frac{1}{3}\cdot\frac{2}{4}\cdot\frac{3}{5}\cdots\frac{18}{20}\cdot\frac{19}{21}\cdot\frac{20}{22}?\]](images/2022/8e422ea624f4cc14204e47ec836017b740d90c3d.png)
![$\textbf{(A) } \frac{1}{462} \qquad \textbf{(B) } \frac{1}{231} \qquad \textbf{(C) } \frac{1}{132} \qquad \textbf{(D) } \frac{2}{213} \qquad \textbf{(E) } \frac{1}{22}$](images/2022/d2cd6cbc287f3b55e0f60488ab663f75a4a5c732.png)

---

## Problem 9

A cup of boiling water (
![$212^{\circ}\text{F}$](images/2022/404c57e29be610b047c2a55b7550d1f1df327f0d.png)
) is placed to cool in a room whose temperature remains constant at
![$68^{\circ}\text{F}$](images/2022/9395c3d9993f49373630ba71370fd9a221e64e00.png)
. Suppose the difference between the water temperature and the room temperature is halved every
![$5$](images/2022/79069377f91364c2f87a64e5f9f562a091c8a6c1.png)
minutes. What is the water temperature, in degrees Fahrenheit, after
![$15$](images/2022/f1965fae079a9ba2c0726c307070c2355dfcb213.png)
minutes?
![$\textbf{(A)} ~77\qquad\textbf{(B)} ~86\qquad\textbf{(C)} ~92\qquad\textbf{(D)} ~98\qquad\textbf{(E)} ~104$](images/2022/81987ad57a71dea2184392c8fe1c7c7f7cf0e3a6.png)

---

## Problem 10

One sunny day, Ling decided to take a hike in the mountains. She left her house at
![$8 \, \textsc{am}$](images/2022/54941816956f9af3d1a673a0b257101d3941f1bb.png)
, drove at a constant speed of
![$45$](images/2022/f27da4fca6f3fecb215974023aad210b70ec3857.png)
miles per hour, and arrived at the hiking trail at
![$10 \, \textsc{am}$](images/2022/efe06edd73213cf2ef1a8fe686c09135c1a7d4d6.png)
. After hiking for
![$3$](images/2022/7cde695f2e4542fd01f860a89189f47a27143b66.png)
hours, Ling drove home at a constant speed of
![$60$](images/2022/302e99c1c7cd91a6ae371139e5142ccef5977dca.png)
miles per hour. Which of the following graphs best illustrates the distance between Ling’s car and her house over the course of her trip?
![[asy] unitsize(12); usepackage("mathptmx"); defaultpen(fontsize(8)+linewidth(.7)); int mod12(int i) {if (i<13) {return i;} else {return i-12;}} void drawgraph(pair sh,string lab) { for (int i=0;i<11;++i) { for (int j=0;j<6;++j) { draw(shift(sh+(i,j))*unitsquare,mediumgray); } } draw(shift(sh)*((-1,0)--(11,0)),EndArrow(angle=20,size=8)); draw(shift(sh)*((0,-1)--(0,6)),EndArrow(angle=20,size=8)); for (int i=1;i<10;++i) { draw(shift(sh)*((i,-.2)--(i,.2))); } label("8\tiny{\textsc{am}}",sh+(1,-.2),S);   for (int i=2;i<9;++i) { label(string(mod12(i+7)),sh+(i,-.2),S); } label("4\tiny{\textsc{pm}}",sh+(9,-.2),S); for (int i=1;i<6;++i) { label(string(30*i),sh+(0,i),2*W); } draw(rotate(90)*"Distance (miles)",sh+(-2.1,3),fontsize(10)); label("$\textbf{("+lab+")}$",sh+(-2.1,6.8),fontsize(12)); } drawgraph((0,0),"A"); drawgraph((15,0),"B"); drawgraph((0,-10),"C"); drawgraph((15,-10),"D"); drawgraph((0,-20),"E"); dotfactor=6; draw((1,0)--(3,3)--(6,3)--(8,0),linewidth(.9)); dot((1,0)^^(3,3)^^(6,3)^^(8,0)); pair sh = (15,0); draw(shift(sh)*((1,0)--(3,1.5)--(6,1.5)--(8,0)),linewidth(.9)); dot(sh+(1,0)^^sh+(3,1.5)^^sh+(6,1.5)^^sh+(8,0)); pair sh = (0,-10); draw(shift(sh)*((1,0)--(3,1.5)--(6,1.5)--(7.5,0)),linewidth(.9)); dot(sh+(1,0)^^sh+(3,1.5)^^sh+(6,1.5)^^sh+(7.5,0)); pair sh = (15,-10); draw(shift(sh)*((1,0)--(3,4)--(6,4)--(9.3,0)),linewidth(.9)); dot(sh+(1,0)^^sh+(3,4)^^sh+(6,4)^^sh+(9.3,0)); pair sh = (0,-20); draw(shift(sh)*((1,0)--(3,3)--(6,3)--(7.5,0)),linewidth(.9)); dot(sh+(1,0)^^sh+(3,3)^^sh+(6,3)^^sh+(7.5,0)); [/asy]](images/2022/cb1e2b28781a01015ec88e8948e5bda92a234383.png)

---

## Problem 11

Henry the donkey has a very long piece of pasta. He takes a number of bites of pasta, each time eating
![$3$](images/2022/7cde695f2e4542fd01f860a89189f47a27143b66.png)
inches of pasta from the middle of one piece. In the end, he has
![$10$](images/2022/fc606f7f1e530731ab4f1cc364c01dc64a4455ee.png)
pieces of pasta whose total length is
![$17$](images/2022/b7616a230c77f0d9a577e5bca01aa06f1c35c457.png)
inches. How long, in inches, was the piece of pasta he started with?
![$\textbf{(A)} ~34\qquad\textbf{(B)} ~38\qquad\textbf{(C)} ~41\qquad\textbf{(D)} ~44\qquad\textbf{(E)} ~47$](images/2022/c1f1bb0a60b69025a2be9de72dddd79e1ab1d396.png)

---

## Problem 12

The arrows on the two spinners shown below are spun. Let the number
![$N$](images/2022/fc97ef67268cd4e91bacdf12b8901d7036c9a056.png)
equal
![$10$](images/2022/fc606f7f1e530731ab4f1cc364c01dc64a4455ee.png)
times the number on Spinner
![$\text{A}$](images/2022/7c43070a2acf8f4e25d98e48c404d9348a26d40b.png)
, added to the number on Spinner
![$\text{B}$](images/2022/09920c3af0daa12ac2ec5174e737c31e0f8cec75.png)
. What is the probability that
![$N$](images/2022/fc97ef67268cd4e91bacdf12b8901d7036c9a056.png)
is a perfect square number?
![[asy] //diagram by pog give me 1 billion dollars for this size(6cm); usepackage("mathptmx"); filldraw(arc((0,0), r=4, angle1=0, angle2=90)--(0,0)--cycle,mediumgray*0.5+gray*0.5); filldraw(arc((0,0), r=4, angle1=90, angle2=180)--(0,0)--cycle,lightgray); filldraw(arc((0,0), r=4, angle1=180, angle2=270)--(0,0)--cycle,mediumgray); filldraw(arc((0,0), r=4, angle1=270, angle2=360)--(0,0)--cycle,lightgray*0.5+mediumgray*0.5); label("$5$", (-1.5,1.7)); label("$6$", (1.5,1.7)); label("$7$", (1.5,-1.7)); label("$8$", (-1.5,-1.7)); label("Spinner A", (0, -5.5)); filldraw(arc((12,0), r=4, angle1=0, angle2=90)--(12,0)--cycle,mediumgray*0.5+gray*0.5); filldraw(arc((12,0), r=4, angle1=90, angle2=180)--(12,0)--cycle,lightgray); filldraw(arc((12,0), r=4, angle1=180, angle2=270)--(12,0)--cycle,mediumgray); filldraw(arc((12,0), r=4, angle1=270, angle2=360)--(12,0)--cycle,lightgray*0.5+mediumgray*0.5); label("$1$", (10.5,1.7)); label("$2$", (13.5,1.7)); label("$3$", (13.5,-1.7)); label("$4$", (10.5,-1.7)); label("Spinner B", (12, -5.5)); [/asy]](images/2022/552b70fd0a4e9d6d464f53f730e82883afd5b278.png)
![$\textbf{(A)} ~\dfrac{1}{16}\qquad\textbf{(B)} ~\dfrac{1}{8}\qquad\textbf{(C)} ~\dfrac{1}{4}\qquad\textbf{(D)} ~\dfrac{3}{8}\qquad\textbf{(E)} ~\dfrac{1}{2}$](images/2022/559a646c5d8a99360021772cf2027f8c8c8168f6.png)

---

## Problem 13

How many positive integers can fill the blank in the sentence below?
“One positive integer is _____ more than twice another, and the sum of the two numbers is
![$28$](images/2022/9265f5dd6dade78136a6be158ace46bf7c0f8ce3.png)
.”
![$\textbf{(A) } 6 \qquad \textbf{(B) } 7 \qquad \textbf{(C) } 8 \qquad \textbf{(D) } 9 \qquad \textbf{(E) } 10$](images/2022/13884693055bd372b32dc0c1a635d563c86e8493.png)

---

## Problem 14

In how many ways can the letters in
![$\textbf{BEEKEEPER}$](images/2022/93a4d908c17ca016cd874a9c4966be856b6399fa.png)
be rearranged so that two or more
![$\textbf{E}$](images/2022/9f10103c414544cc732df788c1d0346e562e7f81.png)
s do not appear together?
![$\textbf{(A) } 1 \qquad \textbf{(B) } 4 \qquad \textbf{(C) } 12 \qquad \textbf{(D) } 24 \qquad \textbf{(E) } 120$](images/2022/372ca0350f523b8f6d20845e561fcc09dff04bae.png)

---

## Problem 15

Laszlo went online to shop for black pepper and found thirty different black pepper options varying in weight and price, shown in the scatter plot below. In ounces, what is the weight of the pepper that offers the lowest price per ounce?
![[asy] //diagram by pog size(5.5cm); usepackage("mathptmx"); defaultpen(mediumgray*0.5+gray*0.5+linewidth(0.63)); add(grid(6,6)); label(scale(0.7)*"$1$", (1,-0.3), black); label(scale(0.7)*"$2$", (2,-0.3), black); label(scale(0.7)*"$3$", (3,-0.3), black); label(scale(0.7)*"$4$", (4,-0.3), black); label(scale(0.7)*"$5$", (5,-0.3), black); label(scale(0.7)*"$1$", (-0.3,1), black); label(scale(0.7)*"$2$", (-0.3,2), black); label(scale(0.7)*"$3$", (-0.3,3), black); label(scale(0.7)*"$4$", (-0.3,4), black); label(scale(0.7)*"$5$", (-0.3,5), black); label(scale(0.8)*rotate(90)*"Price (dollars)", (-1,3.2), black); label(scale(0.8)*"Weight (ounces)", (3.2,-1), black); dot((1,1.2),black); dot((1,1.7),black); dot((1,2),black); dot((1,2.8),black);  dot((1.5,2.1),black); dot((1.5,3),black); dot((1.5,3.3),black); dot((1.5,3.75),black);  dot((2,2),black); dot((2,2.9),black); dot((2,3),black); dot((2,4),black); dot((2,4.35),black); dot((2,4.8),black);  dot((2.5,2.7),black); dot((2.5,3.7),black); dot((2.5,4.2),black); dot((2.5,4.4),black);  dot((3,2.5),black); dot((3,3.4),black); dot((3,4.2),black);  dot((3.5,3.8),black); dot((3.5,4.5),black); dot((3.5,4.8),black);  dot((4,3.9),black); dot((4,5.1),black);  dot((4.5,4.75),black); dot((4.5,5),black);  dot((5,4.5),black); dot((5,5),black); [/asy]](images/2022/6a53d139336647bb978d693c547d713dd1f48d5f.png)
![$\textbf{(A) }1\qquad\textbf{(B) }2\qquad\textbf{(C) }3\qquad\textbf{(D) }4\qquad\textbf{(E) }5$](images/2022/ba71e55b55d1e32bf6faaf16adffc8dc77cb15a8.png)

---

## Problem 16

Four numbers are written in a row. The average of the first two is
![$21,$](images/2022/0ef9ca64d92c34ac479e415fd7a4a0bf81d19028.png)
the average of the middle two is
![$26,$](images/2022/cb5ff27177e75a28a0de33399f94baec8cd2df2b.png)
and the average of the last two is
![$30.$](images/2022/f2a8c6bab62d0931b9d43a9658b409b14b8d7c03.png)
What is the average of the first and last of the numbers?
![$\textbf{(A) } 24 \qquad \textbf{(B) } 25 \qquad \textbf{(C) } 26 \qquad \textbf{(D) } 27 \qquad \textbf{(E) } 28$](images/2022/529c24849cb0739c0db8fa9c01deff692357eb9d.png)

---

## Problem 17

If
![$n$](images/2022/174fadd07fd54c9afe288e96558c92e0c1da733a.png)
is an even positive integer, the
![$\emph{double factorial}$](images/2022/ee60a3911f23afa5db14ac882f0083e91045edcc.png)
notation
![$n!!$](images/2022/a48b26e0e333328642ad64597080192f303f88cf.png)
represents the product of all the even integers from
![$2$](images/2022/41c544263a265ff15498ee45f7392c5f86c6d151.png)
to
![$n$](images/2022/174fadd07fd54c9afe288e96558c92e0c1da733a.png)
. For example,
![$8!! = 2 \cdot 4 \cdot 6 \cdot 8$](images/2022/66fce89d594dfcc770522fec1adaba18c330a12d.png)
. What is the units digit of the following sum?
![\[2!! + 4!! + 6!! + \cdots + 2018!! + 2020!! + 2022!!\]](images/2022/6b7552c1c8d367a79bf701d4631efea748362631.png)
![$\textbf{(A)} ~0\qquad\textbf{(B)} ~2\qquad\textbf{(C)} ~4\qquad\textbf{(D)} ~6\qquad\textbf{(E)} ~8$](images/2022/7bce8b2291c804b669b9c4ef10636c70b5e920e5.png)

---

## Problem 18

The midpoints of the four sides of a rectangle are
![$(-3,0), (2,0), (5,4),$](images/2022/f7cf360ae774e06e0a429d20e3cd6d1980d2db00.png)
and
![$(0,4).$](images/2022/98121c06337629a73bbef8fa46adf7d3220aca4e.png)
What is the
area of the rectangle?
![$\textbf{(A) } 20 \qquad \textbf{(B) } 25 \qquad \textbf{(C) } 40 \qquad \textbf{(D) } 50 \qquad \textbf{(E) } 80$](images/2022/bbfd98561e1883ea5be03715c7dbe1acc3f4c6e0.png)

---

## Problem 19

Mr. Ramos gave a test to his class of
![$20$](images/2022/f8366cd6196dd8a9da6d38a3e9eafb109e99d53e.png)
students. The dot plot below shows the distribution of test scores.
![[asy] //diagram by pog . give me 1,000,000,000 dollars for this diagram size(5cm); defaultpen(0.7); dot((0.5,1)); dot((0.5,1.5)); dot((1.5,1)); dot((1.5,1.5)); dot((2.5,1)); dot((2.5,1.5)); dot((2.5,2)); dot((2.5,2.5)); dot((3.5,1)); dot((3.5,1.5)); dot((3.5,2)); dot((3.5,2.5)); dot((3.5,3)); dot((4.5,1)); dot((4.5,1.5)); dot((5.5,1)); dot((5.5,1.5)); dot((5.5,2)); dot((6.5,1)); dot((7.5,1)); draw((0,0.5)--(8,0.5),linewidth(0.7)); defaultpen(fontsize(10.5pt)); label("$65$", (0.5,-0.1)); label("$70$", (1.5,-0.1)); label("$75$", (2.5,-0.1)); label("$80$", (3.5,-0.1)); label("$85$", (4.5,-0.1)); label("$90$", (5.5,-0.1)); label("$95$", (6.5,-0.1)); label("$100$", (7.5,-0.1)); [/asy]](images/2022/8f168ff6d1e7635e68e0139420bed9ecfc2e4993.png)
Later Mr. Ramos discovered that there was a scoring error on one of the questions. He regraded the tests, awarding some of the students
![$5$](images/2022/79069377f91364c2f87a64e5f9f562a091c8a6c1.png)
extra points, which increased the median test score to
![$85$](images/2022/7fea07b9bf739f8e420081f31186264b91ced2ce.png)
. What is the minimum number of students who received extra points?
(Note that the
median
test score equals the average of the
![$2$](images/2022/41c544263a265ff15498ee45f7392c5f86c6d151.png)
scores in the middle if the
![$20$](images/2022/f8366cd6196dd8a9da6d38a3e9eafb109e99d53e.png)
test scores are arranged in increasing order.)
![$\textbf{(A)} ~2\qquad\textbf{(B)} ~3\qquad\textbf{(C)} ~4\qquad\textbf{(D)} ~5\qquad\textbf{(E)} ~6\qquad$](images/2022/591b6313136fd6b0e87a286b7cc03a2f08df28f3.png)

---

## Problem 20

The grid below is to be filled with integers in such a way that the sum of the numbers in each row and the sum of the numbers in each column are the same. Four numbers are missing. The number
![$x$](images/2022/26eeb5258ca5099acf8fe96b2a1049c48c89a5e6.png)
in the lower left corner is larger than the other three missing numbers. What is the smallest possible value of
![$x$](images/2022/26eeb5258ca5099acf8fe96b2a1049c48c89a5e6.png)
?
![[asy] unitsize(0.5cm); draw((3,3)--(-3,3)); draw((3,1)--(-3,1)); draw((3,-3)--(-3,-3)); draw((3,-1)--(-3,-1)); draw((3,3)--(3,-3)); draw((1,3)--(1,-3)); draw((-3,3)--(-3,-3)); draw((-1,3)--(-1,-3)); label((-2,2),"$-2$"); label((0,2),"$9$"); label((2,2),"$5$"); label((2,0),"${-}1$"); label((2,-2),"$8$"); label((-2,-2),"$x$"); [/asy]](images/2022/814e3a8ce1c3c82c9dc6e97078dc7dbfcc954b3e.png)
![$\textbf{(A) } {-}1 \qquad \textbf{(B) } 5 \qquad \textbf{(C) } 6 \qquad \textbf{(D) } 8 \qquad \textbf{(E) } 9$](images/2022/02f1b78d08938e89ea821bbaf54e8627f279cfab.png)

---

## Problem 21

Steph scored
![$15$](images/2022/f1965fae079a9ba2c0726c307070c2355dfcb213.png)
baskets out of
![$20$](images/2022/f8366cd6196dd8a9da6d38a3e9eafb109e99d53e.png)
attempts in the first half of a game, and
![$10$](images/2022/fc606f7f1e530731ab4f1cc364c01dc64a4455ee.png)
baskets out of
![$10$](images/2022/fc606f7f1e530731ab4f1cc364c01dc64a4455ee.png)
attempts in the second half. Candace took
![$12$](images/2022/edf074831eb5bc9e61d6d6e09f525a86e3068f6a.png)
attempts in the first half and
![$18$](images/2022/5e7a1b6098a8c98b8e4adae526aeef4b91712620.png)
attempts in the second. In each half, Steph scored a higher percentage of baskets than Candace. Surprisingly they ended with the same overall percentage of baskets scored. How many more baskets did Candace score in the second half than in the first?
![[asy] size(7cm); draw((-8,27)--(72,27)); draw((16,0)--(16,35)); draw((40,0)--(40,35)); label("12", (28,3)); draw((25,6.5)--(25,12)--(31,12)--(31,6.5)--cycle); draw((25,5.5)--(31,5.5)); label("18", (56,3)); draw((53,6.5)--(53,12)--(59,12)--(59,6.5)--cycle); draw((53,5.5)--(59,5.5)); draw((53,5.5)--(59,5.5)); label("20", (28,18)); label("15", (28,24)); draw((25,21)--(31,21)); label("10", (56,18)); label("10", (56,24)); draw((53,21)--(59,21)); label("First Half", (28,31)); label("Second Half", (56,31)); label("Candace", (2.35,6)); label("Steph", (0,21)); [/asy]](images/2022/42aefbe42671b2aeb0b90d88e171e5e03a00b73e.png)
![$\textbf{(A) } 7\qquad\textbf{(B) } 8\qquad\textbf{(C) } 9\qquad\textbf{(D) } 10\qquad\textbf{(E) } 11$](images/2022/89c22e2134257867ed57c420ffad70bffabd4f84.png)

---

## Problem 22

A bus takes
![$2$](images/2022/41c544263a265ff15498ee45f7392c5f86c6d151.png)
minutes to drive from one stop to the next, and waits
![$1$](images/2022/dce34f4dfb2406144304ad0d6106c5382ddd1446.png)
minute at each stop to let passengers board. Zia takes
![$5$](images/2022/79069377f91364c2f87a64e5f9f562a091c8a6c1.png)
minutes to walk from one bus stop to the next. As Zia reaches a bus stop, if the bus is at the previous stop or has already left the previous stop, then she will wait for the bus. Otherwise she will start walking toward the next stop. Suppose the bus and Zia start at the same time toward the library, with the bus
![$3$](images/2022/7cde695f2e4542fd01f860a89189f47a27143b66.png)
stops behind. After how many minutes will Zia board the bus?
![2022 AMC 8 Problem 22 Diagram.png](https://wiki-images.artofproblemsolving.com//thumb/5/57/2022_AMC_8_Problem_22_Diagram.png/750px-2022_AMC_8_Problem_22_Diagram.png)
![$\textbf{(A) } 17 \qquad \textbf{(B) } 19 \qquad \textbf{(C) } 20 \qquad \textbf{(D) } 21 \qquad \textbf{(E) } 23$](images/2022/9619c6075ef397361475f26d377ec3aad49ca766.png)

---

## Problem 23

A
![$\triangle$](images/2022/009cf3eeb0ff3789cc057632947cadb200ab4663.png)
or
![$\bigcirc$](images/2022/b1352e2dc4380ca6efe5d978cb4bfa2745354e11.png)
is placed in each of the nine squares in a
![$3$](images/2022/7cde695f2e4542fd01f860a89189f47a27143b66.png)
-by-
![$3$](images/2022/7cde695f2e4542fd01f860a89189f47a27143b66.png)
grid. Shown below is a sample configuration with three
![$\triangle$](images/2022/009cf3eeb0ff3789cc057632947cadb200ab4663.png)
s in a line.
![[asy] //diagram by kante314 size(3.3cm); defaultpen(linewidth(1)); real r = 0.37; path equi = r * dir(-30) -- (r+0.03) * dir(90) -- r * dir(210) -- cycle; draw((0,0)--(0,3)--(3,3)--(3,0)--cycle); draw((0,1)--(3,1)--(3,2)--(0,2)--cycle); draw((1,0)--(1,3)--(2,3)--(2,0)--cycle); draw(circle((3/2,5/2),1/3)); draw(circle((5/2,1/2),1/3)); draw(circle((3/2,3/2),1/3)); draw(shift(0.5,0.38) * equi); draw(shift(1.5,0.38) * equi); draw(shift(0.5,1.38) * equi); draw(shift(2.5,1.38) * equi); draw(shift(0.5,2.38) * equi); draw(shift(2.5,2.38) * equi); [/asy]](images/2022/f79f74a5bed66611fe027a9dd5ab0948b3a033ac.png)
How many configurations will have three
![$\triangle$](images/2022/009cf3eeb0ff3789cc057632947cadb200ab4663.png)
s in a line and three
![$\bigcirc$](images/2022/b1352e2dc4380ca6efe5d978cb4bfa2745354e11.png)
s in a line?
![$\textbf{(A) } 39 \qquad \textbf{(B) } 42 \qquad \textbf{(C) } 78 \qquad \textbf{(D) } 84 \qquad \textbf{(E) } 96$](images/2022/ec62159e4026c1d9554c12f6f114964bc07602a3.png)

---

## Problem 24

The figure below shows a polygon
![$ABCDEFGH$](images/2022/055dcba798b1424c44c2606d913e0f2edab1c5ad.png)
, consisting of rectangles and right triangles. When cut out and folded on the dotted lines, the polygon forms a triangular prism. Suppose that
![$AH = EF = 8$](images/2022/3cf901394acf1512309878143cf57ed4f40af5a2.png)
and
![$GH = 14$](images/2022/eaeff45acba8f616d352f0b033c9ff4df91be514.png)
. What is the volume of the prism?
![[asy] usepackage("mathptmx"); size(275); defaultpen(linewidth(0.8)); real r = 2, s = 2.5, theta = 14; pair G = (0,0), F = (r,0), C = (r,s), B = (0,s), M = (C+F)/2, I = M + s/2 * dir(-theta); pair N = (B+G)/2, J = N + s/2 * dir(180+theta); pair E = F + r * dir(- 45 - theta/2), D = I+E-F; pair H = J + r * dir(135 + theta/2), A = B+H-J; draw(A--B--C--I--D--E--F--G--J--H--cycle^^rightanglemark(F,I,C)^^rightanglemark(G,J,B)); draw(J--B--G^^C--F--I,linetype ("4 4")); dot("$A$",A,N); dot("$B$",B,1.2*N); dot("$C$",C,N); dot("$D$",D,dir(0)); dot("$E$",E,S); dot("$F$",F,1.5*dir(-100)); dot("$G$",G,S); dot("$H$",H,W); dot("$I$",I,NE); dot("$J$",J,1.5*S); [/asy]](images/2022/8c0183579e57a39614f2c3be1824f286b6bf4b86.png)
![$\textbf{(A)} ~112\qquad\textbf{(B)} ~128\qquad\textbf{(C)} ~192\qquad\textbf{(D)} ~240\qquad\textbf{(E)} ~288$](images/2022/5507c5e765f8816bec7865a3d526d7719e7202b2.png)

---

## Problem 25

A cricket randomly hops between
![$4$](images/2022/c7cab1a05e1e0c1d51a6a219d96577a16b7abf9d.png)
leaves, on each turn hopping to one of the other
![$3$](images/2022/7cde695f2e4542fd01f860a89189f47a27143b66.png)
leaves with equal probability. After
![$4$](images/2022/c7cab1a05e1e0c1d51a6a219d96577a16b7abf9d.png)
hops, what is the probability that the cricket has returned to the leaf where it started?
![2022 AMC 8 Problem 25 Picture.jpg](https://wiki-images.artofproblemsolving.com//thumb/f/f0/2022_AMC_8_Problem_25_Picture.jpg/600px-2022_AMC_8_Problem_25_Picture.jpg)
![$\textbf{(A) }\frac{2}{9}\qquad\textbf{(B) }\frac{19}{80}\qquad\textbf{(C) }\frac{20}{81}\qquad\textbf{(D) }\frac{1}{4}\qquad\textbf{(E) }\frac{7}{27}$](images/2022/9e98d700c58057d204da8fa1d899cdc44a91d7c1.png)

---

