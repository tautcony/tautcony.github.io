#include<stdio.h>
#include<string.h>
#include<stdlib.h>

int n,m,i,j,k,a[100];
char url[100][300];
char cover[300];

int cmpfunc(const void * a, const void * b)
{
    return strcmp((const char *)a, (const char *)b);
}

int main()
{
    freopen("in.txt","r",stdin);
    freopen("url.txt","w",stdout);
    n=0;
    cover[0]=0;
    while (scanf("%s",url[n++])==1)
        if (url[n-1][strlen(url[n-1])-2]=='p'){
            memcpy(cover,url[n-1],300*sizeof(char));
            n--;
        }
    n--;
    qsort(url, n, 300*sizeof(char), cmpfunc);
    if (n % 3!=0) return 0;
    if (cover[0]) printf("%s\n\n",cover);
    printf("Comparison (right click on the image and open it in a new tab to see the full-size one)\n");
    printf("Source________________________________________________Encode\n\n");
    for (i=0;i<n;i+=3) printf("[URL=%s][IMG]%s[/IMG][/URL] [URL=%s][IMG]%s[/IMG][/URL]\n",url[i],url[i+1],url[i+2],url[i+1]);   
}
