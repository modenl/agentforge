# AMC 8 2020 Problems

## Problem 1

Luka is making lemonade to sell at a school fundraiser. His recipe requires
![$4$](images/2020/c7cab1a05e1e0c1d51a6a219d96577a16b7abf9d.png)
times as much water as sugar and twice as much sugar as lemon juice. He uses
![$3$](images/2020/7cde695f2e4542fd01f860a89189f47a27143b66.png)
cups of lemon juice. How many cups of water does he need?
![$\textbf{(A) } 6\qquad\textbf{(B) } 8\qquad\textbf{(C) } 12\qquad\textbf{(D) } 18\qquad\textbf{(E) } 24\qquad$](images/2020/e466954e8c082a2aabad9ffc4ff353dc4b3e233a.png)

---

## Problem 2

Four friends do yardwork for their neighbors over the weekend, earning
![$15, $20, $25,$](images/2020/40e538d1a5fbfc50942e89baa7a50351eaad7aa5.png)
and
![$40,$](images/2020/5b47f2b1eb372398a82c21d9e7575e136e4d8ee0.png)
respectively. They decide to split their earnings equally among themselves. In total how much will the friend who earned
![$40$](images/2020/ae7a6304da716110d548a4dc8944c3d41eae0f38.png)
give to the others?
![$\textbf{(A) }$5 \qquad \textbf{(B) }$10 \qquad \textbf{(C) }$15 \qquad \textbf{(D) }$20 \qquad \textbf{(E) }$25$](images/2020/c739ad35f236329630cec971937f1e5c9332b6fc.png)

---

## Problem 3

Carrie has a rectangular garden that measures
![$6$](images/2020/601a7806cbfad68196c43a4665871f8c3186802e.png)
feet by
![$8$](images/2020/8455f3b5cb3b4880b8c9d782a5c1f0334db819eb.png)
feet. She plants the entire garden with strawberry plants. Carrie is able to plant
![$4$](images/2020/c7cab1a05e1e0c1d51a6a219d96577a16b7abf9d.png)
strawberry plants per square foot, and she harvests an average of
![$10$](images/2020/fc606f7f1e530731ab4f1cc364c01dc64a4455ee.png)
strawberries per plant. How many strawberries can she expect to harvest?
![$\textbf{(A) }560 \qquad \textbf{(B) }960 \qquad \textbf{(C) }1120 \qquad \textbf{(D) }1920 \qquad \textbf{(E) }3840$](images/2020/ea4870a42f82b65bf3e9e7103e794c94e26bb764.png)

---

## Problem 4

Three hexagons of increasing size are shown below. Suppose the dot pattern continues so that each successive hexagon contains one more band of dots. How many dots are in the next hexagon?
![[asy] // diagram by SirCalcsALot, edited by MRENTHUSIASM size(250); path p = scale(0.8)*unitcircle; pair[] A; pen grey1 = rgb(100/256, 100/256, 100/256); pen grey2 = rgb(183/256, 183/256, 183/256); for (int i=0; i<7; ++i) { A[i] = rotate(60*i)*(1,0);} path hex = A[0]--A[1]--A[2]--A[3]--A[4]--A[5]--cycle; fill(p,grey1); draw(scale(1.25)*hex,black+linewidth(1.25)); pair S = 6A[0]+2A[1]; fill(shift(S)*p,grey1); for (int i=0; i<6; ++i) { fill(shift(S+2*A[i])*p,grey2);} draw(shift(S)*scale(3.25)*hex,black+linewidth(1.25)); pair T = 16A[0]+4A[1]; fill(shift(T)*p,grey1); for (int i=0; i<6; ++i) {   fill(shift(T+2*A[i])*p,grey2);  fill(shift(T+4*A[i])*p,grey1);  fill(shift(T+2*A[i]+2*A[i+1])*p,grey1); } draw(shift(T)*scale(5.25)*hex,black+linewidth(1.25)); [/asy]](images/2020/381ea96ddcbeccb0522187fcd4a41c78bd9c8364.png)
![$\textbf{(A) }35 \qquad \textbf{(B) }37 \qquad \textbf{(C) }39 \qquad \textbf{(D) }43 \qquad \textbf{(E) }49$](images/2020/bd565a87ea030c83de50f3e05dfbeb33d0a6a813.png)

---

## Problem 5

Three fourths of a pitcher is filled with pineapple juice. The pitcher is emptied by pouring an equal amount of juice into each of
![$5$](images/2020/79069377f91364c2f87a64e5f9f562a091c8a6c1.png)
cups. What percent of the total capacity of the pitcher did each cup receive?
![$\textbf{(A) }5 \qquad \textbf{(B) }10 \qquad \textbf{(C) }15 \qquad \textbf{(D) }20 \qquad \textbf{(E) }25$](images/2020/fa8942b573bb647a482e00a2e52fb0e184502d05.png)

---

## Problem 6

Aaron, Darren, Karen, Maren, and Sharon rode on a small train that has five cars that seat one person each. Maren sat in the last car. Aaron sat directly behind Sharon. Darren sat in one of the cars in front of Aaron. At least one person sat between Karen and Darren. Who sat in the middle car?
![$\textbf{(A) }\text{Aaron} \qquad \textbf{(B) }\text{Darren} \qquad \textbf{(C) }\text{Karen} \qquad \textbf{(D) }\text{Maren}\qquad \textbf{(E) }\text{Sharon}$](images/2020/ac67e5c953ebf1d24aa0aab9fb41d78e4e08dfdc.png)

---

## Problem 7

How many integers between
![$2020$](images/2020/509a9369d5c55fd98dc99cb2938fb44f0101f90a.png)
and
![$2400$](images/2020/e4208d59c57ee9a549ff172069df39fac811d562.png)
have four distinct digits arranged in increasing order? (For example,
![$2347$](images/2020/c6cc52c1454e5392f8829f459fc11dfd634c673e.png)
is one integer.)
![$\textbf{(A) }\text{9} \qquad \textbf{(B) }\text{10} \qquad \textbf{(C) }\text{15} \qquad \textbf{(D) }\text{21}\qquad \textbf{(E) }\text{28}$](images/2020/b8fa9c02d0ff7c3806efdbe934e0106da633713b.png)

---

## Problem 8

Ricardo has
![$2020$](images/2020/509a9369d5c55fd98dc99cb2938fb44f0101f90a.png)
coins, some of which are pennies (
![$1$](images/2020/dce34f4dfb2406144304ad0d6106c5382ddd1446.png)
-cent coins) and the rest of which are nickels (
![$5$](images/2020/79069377f91364c2f87a64e5f9f562a091c8a6c1.png)
-cent coins). He has at least one penny and at least one nickel. What is the difference in cents between the greatest possible and least possible amounts of money that Ricardo can have?
![$\textbf{(A) }\text{8062} \qquad \textbf{(B) }\text{8068} \qquad \textbf{(C) }\text{8072} \qquad \textbf{(D) }\text{8076}\qquad \textbf{(E) }\text{8082}$](images/2020/aa64b9df38498a09edd3673849ab1d543ab05dd9.png)

---

## Problem 9

Akash's birthday cake is in the form of a
![$4 \times 4 \times 4$](images/2020/e7230ec499ccbbd83bec8a0f427eac2b6514d4e0.png)
inch cube. The cake has icing on the top and the four side faces, and no icing on the bottom. Suppose the cake is cut into
![$64$](images/2020/05e228ac5bee7b9ffb60cacf50f3f2c7c31f8038.png)
smaller cubes, each measuring
![$1 \times 1 \times 1$](images/2020/c58deba0f41c4da22eb2c1016638fd874231c042.png)
inch, as shown below. How many small pieces will have icing on exactly two sides?
![[asy] import three; currentprojection=orthographic(1.75,7,2);  //++++ edit colors, names are self-explainatory ++++ //pen top=rgb(27/255, 135/255, 212/255); //pen right=rgb(254/255,245/255,182/255); //pen left=rgb(153/255,200/255,99/255); pen top = rgb(170/255, 170/255, 170/255); pen left = rgb(81/255, 81/255, 81/255); pen right = rgb(165/255, 165/255, 165/255); pen edges=black; int max_side = 4; //+++++++++++++++++++++++++++++++++++++++  path3 leftface=(1,0,0)--(1,1,0)--(1,1,1)--(1,0,1)--cycle; path3 rightface=(0,1,0)--(1,1,0)--(1,1,1)--(0,1,1)--cycle; path3 topface=(0,0,1)--(1,0,1)--(1,1,1)--(0,1,1)--cycle;  for(int i=0; i<max_side; ++i){ for(int j=0; j<max_side; ++j){  draw(shift(i,j,-1)*surface(topface),top); draw(shift(i,j,-1)*topface,edges);  draw(shift(i,-1,j)*surface(rightface),right); draw(shift(i,-1,j)*rightface,edges);  draw(shift(-1,j,i)*surface(leftface),left); draw(shift(-1,j,i)*leftface,edges);  } }  picture CUBE; draw(CUBE,surface(leftface),left,nolight); draw(CUBE,surface(rightface),right,nolight); draw(CUBE,surface(topface),top,nolight); draw(CUBE,topface,edges); draw(CUBE,leftface,edges); draw(CUBE,rightface,edges);  int[][] heights = {{4,4,4,4},{4,4,4,4},{4,4,4,4},{4,4,4,4}};  for (int i = 0; i < max_side; ++i) { for (int j = 0; j < max_side; ++j) { for (int k = 0; k < min(heights[i][j], max_side); ++k) { add(shift(i,j,k)*CUBE); } } } [/asy]](images/2020/13575720613929277699552cc394543fb9d0346b.png)
![$\textbf{(A) }\text{12} \qquad \textbf{(B) }\text{16} \qquad \textbf{(C) }\text{18} \qquad \textbf{(D) }\text{20}\qquad \textbf{(E) }\text{24}$](images/2020/7f75b9be1be21a1356f61ecdf8bd7e2a2f415b95.png)

---

## Problem 10

Zara has a collection of
![$4$](images/2020/c7cab1a05e1e0c1d51a6a219d96577a16b7abf9d.png)
marbles: an Aggie, a Bumblebee, a Steelie, and a Tiger. She wants to display them in a row on a shelf, but does not want to put the Steelie and the Tiger next to one another. In how many ways can she do this?
![$\textbf{(A) }6 \qquad \textbf{(B) }8 \qquad \textbf{(C) }12 \qquad \textbf{(D) }18 \qquad \textbf{(E) }24$](images/2020/d50650c6096434ab4938e1bc546e13d3e162ebbf.png)

---

## Problem 11

After school, Maya and Naomi headed to the beach,
![$6$](images/2020/601a7806cbfad68196c43a4665871f8c3186802e.png)
miles away. Maya decided to bike while Naomi took a bus. The graph below shows their journeys, indicating the time and distance traveled. What was the difference, in miles per hour, between Naomi's and Maya's average speeds?
![[asy] // diagram by SirCalcsALot unitsize(1.25cm); dotfactor = 10; pen shortdashed=linetype(new real[] {2.7,2.7});  for (int i = 0; i < 6; ++i) {     for (int j = 0; j < 6; ++j) {         draw((i,0)--(i,6), grey);         draw((0,j)--(6,j), grey);     } }  for (int i = 1; i <= 6; ++i) {     draw((-0.1,i)--(0.1,i),linewidth(1.25));     draw((i,-0.1)--(i,0.1),linewidth(1.25));     label(string(5*i), (i,0), 2*S);     label(string(i), (0, i), 2*W);  }  draw((0,0)--(0,6)--(6,6)--(6,0)--(0,0)--cycle,linewidth(1.25));  label(rotate(90) * "Distance (miles)", (-0.5,3), W); label("Time (minutes)", (3,-0.5), S);  dot("Naomi", (2,6), 3*dir(305)); dot((6,6));  label("Maya", (4.45,3.5));  draw((0,0)--(1.15,1.3)--(1.55,1.3)--(3.15,3.2)--(3.65,3.2)--(5.2,5.2)--(5.4,5.2)--(6,6),linewidth(1.35)); draw((0,0)--(0.4,0.1)--(1.15,3.7)--(1.6,3.7)--(2,6),linewidth(1.35)+shortdashed); [/asy]](images/2020/869acf55e021604fd3829ae77107a07511f6945f.png)
![$\textbf{(A) }6 \qquad \textbf{(B) }12 \qquad \textbf{(C) }18 \qquad \textbf{(D) }20 \qquad \textbf{(E) }24$](images/2020/8d87dfd17115ce71d5f033cbaa24fc923b031907.png)

---

## Problem 12

For a positive integer
![$n,$](images/2020/c54e7152acd659788861f0453ac195c635e0a005.png)
the factorial notation
![$n!$](images/2020/63f344e7d8b14a7886fc7fb72da53cd0a3271dcc.png)
represents the product of the integers
from
![$n$](images/2020/174fadd07fd54c9afe288e96558c92e0c1da733a.png)
to
![$1$](images/2020/dce34f4dfb2406144304ad0d6106c5382ddd1446.png)
. (For example,
![$6! = 6 \cdot 5 \cdot 4 \cdot 3 \cdot 2 \cdot 1$](images/2020/6a1e708a7d441dd11245c67fc2a18ce2168c9047.png)
.) What value of
![$N$](images/2020/fc97ef67268cd4e91bacdf12b8901d7036c9a056.png)
satisfies the following equation?
![\[5! \cdot 9! = 12 \cdot N!\]](images/2020/ca29f6c195342acdd31f46bca2322a6fbdfeb766.png)
![$\textbf{(A) }10 \qquad \textbf{(B) }11 \qquad \textbf{(C) }12 \qquad \textbf{(D) }13 \qquad \textbf{(E) }14$](images/2020/8fa433e89ea59bd5dc7833bbebd71e931277909d.png)

---

## Problem 13

Jamal has a drawer containing
![$6$](images/2020/601a7806cbfad68196c43a4665871f8c3186802e.png)
green socks,
![$18$](images/2020/5e7a1b6098a8c98b8e4adae526aeef4b91712620.png)
purple socks, and
![$12$](images/2020/edf074831eb5bc9e61d6d6e09f525a86e3068f6a.png)
orange socks. After adding more purple socks, Jamal noticed that there is now a
![$60\%$](images/2020/fd7edd3842c40dbc1e54e522917a6e07b43c92e2.png)
chance that a sock randomly selected from the drawer is purple. How many purple socks did Jamal add?
![$\textbf{(A) }6 \qquad \textbf{(B) }9 \qquad \textbf{(C) }12 \qquad \textbf{(D) }18 \qquad \textbf{(E) }24$](images/2020/eb95cf177940d5c2a355be4f25b14985d485d2bc.png)

---

## Problem 14

There are
![$20$](images/2020/f8366cd6196dd8a9da6d38a3e9eafb109e99d53e.png)
cities in the County of Newton. Their populations are shown in the bar chart below. The average population of all the cities is indicated by the horizontal dashed line. Which of the following is closest to the total population of all
![$20$](images/2020/f8366cd6196dd8a9da6d38a3e9eafb109e99d53e.png)
cities?
![[asy] // made by SirCalcsALot  size(300);  pen shortdashed=linetype(new real[] {6,6});  for (int i = 2000; i < 9000; i = i + 2000) {     draw((0,i)--(11550,i), linewidth(0.5)+1.5*grey);     label(string(i), (0,i), W); }   for (int i = 500; i < 9300; i=i+500) {     draw((0,i)--(150,i),linewidth(1.25));     if (i % 2000 == 0) {         draw((0,i)--(250,i),linewidth(1.25));     } }  int[] data = {8750, 3800, 5000, 2900, 6400, 7500, 4100, 1400, 2600, 1470, 2600, 7100, 4070, 7500, 7000, 8100, 1900, 1600, 5850, 5750}; int data_length = 20;  int r = 550; for (int i = 0; i < data_length; ++i) {     fill(((i+1)*r,0)--((i+1)*r, data[i])--((i+1)*r,0)--((i+1)*r, data[i])--((i+1)*r,0)--((i+1)*r, data[i])--((i+2)*r-100, data[i])--((i+2)*r-100,0)--cycle, 1.5*grey);     draw(((i+1)*r,0)--((i+1)*r, data[i])--((i+1)*r,0)--((i+1)*r, data[i])--((i+1)*r,0)--((i+1)*r, data[i])--((i+2)*r-100, data[i])--((i+2)*r-100,0)); }  draw((0,4750)--(11450,4750),shortdashed);  label("Cities", (11450*0.5,0), S); label(rotate(90)*"Population", (0,9000*0.5), 10*W);  // axis draw((0,0)--(0,9300), linewidth(1.25)); draw((0,0)--(11550,0), linewidth(1.25)); [/asy]](images/2020/abffd65d59aacaaf81b6039c162d0898cca8b729.png)
![$\textbf{(A) }65{,}000 \qquad \textbf{(B) }75{,}000 \qquad \textbf{(C) }85{,}000 \qquad \textbf{(D) }95{,}000 \qquad \textbf{(E) }105{,}000$](images/2020/1c2783d3edfdcd47b5e4487a386636a80d1bbe4a.png)

---

## Problem 15

Suppose
![$15\%$](images/2020/87a8787ca8fcdf64f42e938d20fa64f63871646d.png)
of
![$x$](images/2020/26eeb5258ca5099acf8fe96b2a1049c48c89a5e6.png)
equals
![$20\%$](images/2020/1183a12017e48198b3352789cc39b223b17945d6.png)
of
![$y.$](images/2020/56e228943301b048f242377b3b24717037d5996f.png)
What percentage of
![$x$](images/2020/26eeb5258ca5099acf8fe96b2a1049c48c89a5e6.png)
is
![$y?$](images/2020/ee326c993c95f1656496d2d74ca2270dd268c4c5.png)
![$\textbf{(A) }5 \qquad \textbf{(B) }35 \qquad \textbf{(C) }75 \qquad \textbf{(D) }133 \frac13 \qquad \textbf{(E) }300$](images/2020/cc6547043664c2f58109922dbc9c50e3ec4ac321.png)

---

## Problem 16

Each of the points
![$A,B,C,D,E,$](images/2020/84785c4da5d7220a503a2ecfafe0a08090047ff3.png)
and
![$F$](images/2020/a055f405829e64a3b70253ab67cb45ed6ed5bb29.png)
in the figure below represents a different digit from
![$1$](images/2020/dce34f4dfb2406144304ad0d6106c5382ddd1446.png)
to
![$6.$](images/2020/1de3ed5fb7fa9b1fa73395d65c43e5bc81cd9d61.png)
Each of the five lines shown passes through some of these points. The digits along each line are added to produce five sums, one for each line. The total of the five sums is
![$47.$](images/2020/c8d06fc910703a003655e44dbcd4f3626ee6d02f.png)
What is the digit represented by B?
![[asy] // made by SirCalcsALot  size(200); dotfactor = 10;  pair p1 = (-28,0); pair p2 = (-111,213); draw(p1--p2,linewidth(1));  pair p3 = (-160,0); pair p4 = (-244,213); draw(p3--p4,linewidth(1));  pair p5 = (-316,0); pair p6 = (-67,213); draw(p5--p6,linewidth(1));  pair p7 = (0, 68); pair p8 = (-350,10); draw(p7--p8,linewidth(1));  pair p9 = (0, 150); pair p10 = (-350, 62); draw(p9--p10,linewidth(1));  pair A = intersectionpoint(p1--p2, p5--p6); dot("$A$", A, 2*W);  pair B = intersectionpoint(p5--p6, p3--p4); dot("$B$", B, 2*WNW);  pair C = intersectionpoint(p7--p8, p5--p6); dot("$C$", C, 1.5*NW);  pair D = intersectionpoint(p3--p4, p7--p8); dot("$D$", D, 2*NNE);  pair EE = intersectionpoint(p1--p2, p7--p8); dot("$E$", EE, 2*NNE);  pair F = intersectionpoint(p1--p2, p9--p10); dot("$F$", F, 2*NNE); [/asy]](images/2020/9f1f0f8c2be3a35542af7640459f9a938b659c27.png)
![$\textbf{(A) }1 \qquad \textbf{(B) }2 \qquad \textbf{(C) }3 \qquad \textbf{(D) }4 \qquad \textbf{(E) }5$](images/2020/b26b558fdb444715fcf411132081235bd3a230a0.png)

---

## Problem 17

How many factors of
![$2020$](images/2020/509a9369d5c55fd98dc99cb2938fb44f0101f90a.png)
have more than
![$3$](images/2020/7cde695f2e4542fd01f860a89189f47a27143b66.png)
factors? (As an example,
![$12$](images/2020/edf074831eb5bc9e61d6d6e09f525a86e3068f6a.png)
has
![$6$](images/2020/601a7806cbfad68196c43a4665871f8c3186802e.png)
factors, namely
![$1, 2, 3, 4, 6,$](images/2020/6d50b208ea12504855628a5fd46850f88578a63e.png)
and
![$12.$](images/2020/b40dc5c54a0dac797341eefc0e3befa7caa8d74f.png)
)
![$\textbf{(A) }6 \qquad \textbf{(B) }7 \qquad \textbf{(C) }8 \qquad \textbf{(D) }9 \qquad \textbf{(E) }10$](images/2020/46c41c9d3221c2e725aeae726ece810aab68d1a0.png)

---

## Problem 18

Rectangle
![$ABCD$](images/2020/f9efaf9474c5658c4089523e2aff4e11488f8603.png)
is inscribed in a semicircle with diameter
![$\overline{FE},$](images/2020/0af92a37effb62a6c7368d1f2fc5ffd9e1674685.png)
as shown in the figure. Let
![$DA=16,$](images/2020/7518b5f1128de37e4c7fe5c006c28cc40de96943.png)
and let
![$FD=AE=9.$](images/2020/91b178cb0d42a2530a685f5e7bf50425d9d6e3f5.png)
What is the area of
![$ABCD?$](images/2020/d64633b1612a0801fc7f0316fdbdf0adf1f2d70d.png)
![[asy] // diagram by SirCalcsALot draw(arc((0,0),17,180,0)); draw((-17,0)--(17,0)); fill((-8,0)--(-8,15)--(8,15)--(8,0)--cycle, 1.5*grey); draw((-8,0)--(-8,15)--(8,15)--(8,0)--cycle); dot("$A$",(8,0), 1.25*S); dot("$B$",(8,15), 1.25*N); dot("$C$",(-8,15), 1.25*N); dot("$D$",(-8,0), 1.25*S); dot("$E$",(17,0), 1.25*S); dot("$F$",(-17,0), 1.25*S); label("$16$",(0,0),N); label("$9$",(12.5,0),N); label("$9$",(-12.5,0),N); [/asy]](images/2020/15fcfb06af407c88283742b188e91074fb48b60a.png)
![$\textbf{(A) }240 \qquad \textbf{(B) }248 \qquad \textbf{(C) }256 \qquad \textbf{(D) }264 \qquad \textbf{(E) }272$](images/2020/3fca3ac8d18bcfd74d7ba1b668fbc1a1ee4fbed2.png)

---

## Problem 19

A number is called flippy if its digits alternate between two distinct digits. For example,
![$2020$](images/2020/509a9369d5c55fd98dc99cb2938fb44f0101f90a.png)
and
![$37373$](images/2020/92749ff1fc2ac6ac551b2e7a0381f9ec4d8427ef.png)
are flippy, but
![$3883$](images/2020/e8fde3061600d0a096677628ddb37b176c91e386.png)
and
![$123123$](images/2020/86c5224bc4a0f596b52ae8acd376795ff7c152f5.png)
are not. How many five-digit flippy numbers are divisible by
![$15?$](images/2020/38905acc065b7a4d105b1a665f63d63db9242638.png)
![$\textbf{(A) }3 \qquad \textbf{(B) }4 \qquad \textbf{(C) }5 \qquad \textbf{(D) }6 \qquad \textbf{(E) }8$](images/2020/cce2de9ae64d0cc1ae9dfce3386ecc0b9b2ba5b0.png)

---

## Problem 20

A scientist walking through a forest recorded as integers the heights of
![$5$](images/2020/79069377f91364c2f87a64e5f9f562a091c8a6c1.png)
trees standing in a row. She observed that each tree was either twice as tall or half as tall as the one to its right. Unfortunately some of her data was lost when rain fell on her notebook. Her notes are shown below, with blanks indicating the missing numbers. Based on her observations, the scientist was able to reconstruct the lost data. What was the average height of the trees, in meters?
![\[\begingroup \setlength{\tabcolsep}{10pt} \renewcommand{\arraystretch}{1.5} \begin{tabular}{|c|c|} \hline Tree 1 & \rule{0.4cm}{0.15mm} meters \\ Tree 2 & 11 meters \\ Tree 3 & \rule{0.5cm}{0.15mm} meters \\ Tree 4 & \rule{0.5cm}{0.15mm} meters \\ Tree 5 & \rule{0.5cm}{0.15mm} meters \\ \hline Average height & \rule{0.5cm}{0.15mm}\text{ .}2 meters \\ \hline \end{tabular} \endgroup\]](images/2020/f706bfa6f4339d99d594acb5159f6140c8eb1bb9.png)
![$\textbf{(A) }22.2 \qquad \textbf{(B) }24.2 \qquad \textbf{(C) }33.2 \qquad \textbf{(D) }35.2 \qquad \textbf{(E) }37.2$](images/2020/899c7201702ce4ed819baee7eaf1a55132dad35f.png)

---

## Problem 21

A game board consists of
![$64$](images/2020/05e228ac5bee7b9ffb60cacf50f3f2c7c31f8038.png)
squares that alternate in color between black and white. The figure below shows square
![$P$](images/2020/4b4cade9ca8a2c8311fafcf040bc5b15ca507f52.png)
in the bottom row and square
![$Q$](images/2020/9866e3a998d628ba0941eb4fea0666ac391d149a.png)
in the top row. A marker is placed at
![$P.$](images/2020/e3ce33ec2a34dc4fddaec3224043f4a72bbe6d0e.png)
A step consists of moving the marker onto one of the adjoining white squares in the row above. How many
![$7$](images/2020/e0a0db32027a732ac57d37ef2ae9bb150f65b108.png)
-step paths are there from
![$P$](images/2020/4b4cade9ca8a2c8311fafcf040bc5b15ca507f52.png)
to
![$Q?$](images/2020/5351d296b5674cb8207a306f4412527dab730631.png)
(The figure shows a sample path.)
![[asy] // diagram by SirCalcsALot size(200); int[] x = {6, 5, 4, 5, 6, 5, 6}; int[] y = {1, 2, 3, 4, 5, 6, 7}; int N = 7; for (int i = 0; i < 8; ++i) { for (int j = 0; j < 8; ++j) { draw((i,j)--(i+1,j)--(i+1,j+1)--(i,j+1)--(i,j)); if ((i+j) % 2 == 0) { filldraw((i,j)--(i+1,j)--(i+1,j+1)--(i,j+1)--(i,j)--cycle,black); } } } for (int i = 0; i < N; ++i) { draw(circle((x[i],y[i])+(0.5,0.5),0.35),grey); } label("$P$", (5.5, 0.5)); label("$Q$", (6.5, 7.5)); [/asy]](images/2020/3626126e77aef045aa58c34a5af6adc480e57f17.png)
![$\textbf{(A) }28 \qquad \textbf{(B) }30 \qquad \textbf{(C) }32 \qquad \textbf{(D) }33 \qquad \textbf{(E) }35$](images/2020/4afd089177252e283e0176cd12e59980f95df741.png)

---

## Problem 22

When a positive integer
![$N$](images/2020/fc97ef67268cd4e91bacdf12b8901d7036c9a056.png)
is fed into a machine, the output is a number calculated according to the rule shown below.
![[asy] size(300); defaultpen(linewidth(0.8)+fontsize(13)); real r = 0.05; draw((0.9,0)--(3.5,0),EndArrow(size=7)); filldraw((4,2.5)--(7,2.5)--(7,-2.5)--(4,-2.5)--cycle,gray(0.65)); fill(circle((5.5,1.25),0.8),white); fill(circle((5.5,1.25),0.5),gray(0.65)); fill((4.3,-r)--(6.7,-r)--(6.7,-1-r)--(4.3,-1-r)--cycle,white); fill((4.3,-1.25+r)--(6.7,-1.25+r)--(6.7,-2.25+r)--(4.3,-2.25+r)--cycle,white); fill((4.6,-0.25-r)--(6.4,-0.25-r)--(6.4,-0.75-r)--(4.6,-0.75-r)--cycle,gray(0.65)); fill((4.6,-1.5+r)--(6.4,-1.5+r)--(6.4,-2+r)--(4.6,-2+r)--cycle,gray(0.65)); label("$N$",(0.45,0)); draw((7.5,1.25)--(11.25,1.25),EndArrow(size=7)); draw((7.5,-1.25)--(11.25,-1.25),EndArrow(size=7)); label("if $N$ is even",(9.25,1.25),N); label("if $N$ is odd",(9.25,-1.25),N); label("$\frac N2$",(12,1.25)); label("$3N+1$",(12.6,-1.25)); [/asy]](images/2020/640f84b97add51c20f2c5af092b282884530e77b.png)
For example, starting with an input of
![$N=7,$](images/2020/5e3873c70c300e3ec4b63524055644844431adcf.png)
the machine will output
![$3 \cdot 7 +1 = 22.$](images/2020/b48891506b80a9964c81c03caf05cc4dd69deb92.png)
Then if the output is repeatedly inserted into the machine five more times, the final output is
![$26.$](images/2020/0493cb27bc77732e314703377654d93b2b21160f.png)
![\[7 \to 22 \to 11 \to 34 \to 17 \to 52 \to 26\]](images/2020/4f7a3ef049942c89a393ca7cf10d85cc7ddd0b8d.png)
When the same
![$6$](images/2020/601a7806cbfad68196c43a4665871f8c3186802e.png)
-step process is applied to a different starting value of
![$N,$](images/2020/35672a19103f2ead1f02935bb8450addc3318b94.png)
the final output is
![$1.$](images/2020/6cdd1b53e5faf7a118222e4b7571d1e9afa0cf56.png)
What is the sum of all such integers
![$N?$](images/2020/85cf31acc4d19289fd14d58e39c17cff9fe2b0e4.png)
![\[N \to \rule{0.5cm}{0.15mm} \to \rule{0.5cm}{0.15mm} \to \rule{0.5cm}{0.15mm} \to \rule{0.5cm}{0.15mm} \to \rule{0.5cm}{0.15mm} \to 1\]](images/2020/c8914c251134025522a9009e8cdf1f898c2e9e08.png)
![$\textbf{(A) }73 \qquad \textbf{(B) }74 \qquad \textbf{(C) }75 \qquad \textbf{(D) }82 \qquad \textbf{(E) }83$](images/2020/28b85e18a5399ac1ecb0af9bf357d1864c0f61c1.png)

---

## Problem 23

Five different awards are to be given to three students. Each student will receive at least one award. In how many different ways can the awards be distributed?
![$\textbf{(A) }120 \qquad \textbf{(B) }150 \qquad \textbf{(C) }180 \qquad \textbf{(D) }210 \qquad \textbf{(E) }240$](images/2020/9544dac932fa0658ff020fa6667eb1bb783e3172.png)

---

## Problem 24

A large square region is paved with
![$n^2$](images/2020/6006bba637eef443381fbaff768fa62d9ff41e62.png)
gray square tiles, each measuring
![$s$](images/2020/f37bba504894945c07a32f5496d74299a37aa51c.png)
inches on a side. A border
![$d$](images/2020/96ab646de7704969b91c76a214126b45f2b07b25.png)
inches wide surrounds each tile. The figure below shows the case for
![$n=3$](images/2020/5635737307f5f0651cced8ee2e6558a426fd27b5.png)
. When
![$n=24$](images/2020/ece448a1996d075309961bd398a7c8afc99a50e0.png)
, the
![$576$](images/2020/7080fdbf6e7385fb60b23d885788d3bd7eda12a9.png)
gray tiles cover
![$64\%$](images/2020/82c2d0dd5aaa1283b9aed82f11835088b120a596.png)
of the area of the large square region. What is the ratio
![$\frac{d}{s}$](images/2020/11ad8a0a7d748c67f54b6c7d20551b8a84672174.png)
for this larger value of
![$n?$](images/2020/a28578f91569670ce8f5d1c27b4ea637a09a75a9.png)
![[asy] draw((0,0)--(13,0)--(13,13)--(0,13)--cycle); filldraw((1,1)--(4,1)--(4,4)--(1,4)--cycle, mediumgray); filldraw((1,5)--(4,5)--(4,8)--(1,8)--cycle, mediumgray); filldraw((1,9)--(4,9)--(4,12)--(1,12)--cycle, mediumgray); filldraw((5,1)--(8,1)--(8,4)--(5,4)--cycle, mediumgray); filldraw((5,5)--(8,5)--(8,8)--(5,8)--cycle, mediumgray); filldraw((5,9)--(8,9)--(8,12)--(5,12)--cycle, mediumgray); filldraw((9,1)--(12,1)--(12,4)--(9,4)--cycle, mediumgray); filldraw((9,5)--(12,5)--(12,8)--(9,8)--cycle, mediumgray); filldraw((9,9)--(12,9)--(12,12)--(9,12)--cycle, mediumgray); [/asy]](images/2020/c0d420afb8c2f467480a85d6c02e403e50af81a8.png)
![$\textbf{(A) }\frac6{25} \qquad \textbf{(B) }\frac14 \qquad \textbf{(C) }\frac9{25} \qquad \textbf{(D) }\frac7{16} \qquad \textbf{(E) }\frac9{16}$](images/2020/7004618c7a077fbc6d7e042a08041d3e0f1d0e48.png)

---

## Problem 25

Rectangles
![$R_1$](images/2020/77cbbeb5834997d74dbc44264f04660c2bf84077.png)
and
![$R_2,$](images/2020/d827a7250d7f013c7e2f06086437f8d6e96bb4bc.png)
and squares
![$S_1,\,S_2,\,$](images/2020/d36755eb43fc4282dcd8dc2a86a8c1db06152112.png)
and
![$S_3,$](images/2020/47d9096e86c64fbe0efd78f38515c560424d5de8.png)
shown below, combine to form a rectangle that is 3322 units wide and 2020 units high. What is the side length of
![$S_2$](images/2020/7f4caea56d945d0b6e49701b42ce06e0fb92e663.png)
in units?
![[asy] draw((0,0)--(5,0)--(5,3)--(0,3)--(0,0)); draw((3,0)--(3,1)--(0,1)); draw((3,1)--(3,2)--(5,2)); draw((3,2)--(2,2)--(2,1)--(2,3)); label("$R_1$",(3/2,1/2)); label("$S_3$",(4,1)); label("$S_2$",(5/2,3/2)); label("$S_1$",(1,2)); label("$R_2$",(7/2,5/2)); [/asy]](images/2020/a55c518a1179d67520c6a03827b4ba25ca1413f2.png)
![$\textbf{(A) }651 \qquad \textbf{(B) }655 \qquad \textbf{(C) }656 \qquad \textbf{(D) }662 \qquad \textbf{(E) }666$](images/2020/bbca9ed9f6270ad681b11d70d6bbceb1ea2afb83.png)

---

