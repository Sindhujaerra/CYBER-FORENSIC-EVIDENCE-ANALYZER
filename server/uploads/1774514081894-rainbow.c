#include<stdio.h>
#include<conio.h>
#include<dos.h>
#include<graphics.h>
void main()
{
	int gd=DETECT,gm;
	int x,y,i;
	initgraph(&gdriver,&gmode,"C:\\Turbo3"\\BGI);
	x=getmaxx()/2;
	y=getmaxy()/2;
	for(i=30;i<200;i++)
	{
		delay(100);
		setcolor(i/10);
		arc(x,y,0,180,i-10);
	}
	getch();
}
