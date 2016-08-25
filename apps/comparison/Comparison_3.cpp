#include<stdio.h>
#include<string.h>
#include<stdlib.h>
#include<ctype.h>

int n,m,i,j,k,a[100];
char url[100][300],cover[300],*p;

int cmpfunc(const void * a, const void * b)
{
    const char *x = (const char *)a, *y = (const char *)b;
    int p = strlen(x), q = strlen(y);
    if (p<q) return -1;
    if (p>q) return 1;
    return strcmp(x,y);
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
        } else {
            i = strlen(url[n-1]);
            if (isdigit(url[n-1][i-5]))
                url[n-1][i-4]=0;
            else
                url[n-1][i-5]=0;
        }
    n--;
    qsort(url, n, 300*sizeof(char), cmpfunc);
    if (cover[0]) printf("%s\n\n",cover);
    printf("Comparison (right click on the image and open it in a new tab to see the full-size one)\n");
    printf("Source________________________________________________Encode\n\n");
    for (i=0;i<n;i+=3) printf("[URL=%s.png][IMG]%ss.png[/IMG][/URL] [URL=%sv.png][IMG]%ss.png[/IMG][/URL]\n",url[i],url[i],url[i],url[i]);
    return 0;
}
