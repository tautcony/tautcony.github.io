---
layout:     post
title:      "Docker 安装 MySQL 踩坑实录"
subtitle:   "其实还有好些坑被视而不见"
date:       2019-04-05
author:     "TautCony"
header-img: null
image:
  credit: GeoPattern
  creditlink: https://github.com/btmills/geopattern
tags:
    - 编程
---


突然发现我已经落后时代好久了，明明网上都已张口闭口容器而我却没用过。

<!--more-->

于是在假日第一天就决定在服务器上用docker部署一下mysql（虽然现时根本什么应用在现时需要MySQL，甚至之前写的bot用的都是mongodb

docker的安装么照着文档一通复制就完事了，没啥可说的（

既然要装MySQL，先搜搜镜像应该是个啥名，`docker search mysql`一下，有点神秘，选个官方的吧，再接着是MySQL的版本，我头铁，选个8吧。

|        NAME        |                  DESCRIPTION                   | STARS | OFFICIAL | AUTOMATED |
| ------------------ | ---------------------------------------------- | ----- | -------- | --------- |
| mysql              | MySQL is a widely used, open-source relation… |  7980 |   [OK]   |           |
| mariadb            | MariaDB is a community-developed fork of MyS… |  2679 |   [OK]   |           |
| mysql/mysql-server | Optimized MySQL Server Docker images. Create… |  600  |          |    [OK]   |

倒腾了一下，大概知道了怎么创建一个MySQL的容器。

`docker run --name mysql -e MYSQL_ROOT_PASSWORD=<PASSWORD> -p 127.0.0.1:3306:3306 -d mysql:8`

然后搭配一个相关应用看看效果，当当当当，`phpmyadmin`!

由于MySQL也是在容器里的，那么根据文档使用--link参数进行创建。

`docker run --name myadmin --link mysql:db -p 9100:80 -d phpmyadmin/phpmyadmin:edge-4.8`

> 配置完成后，就该看看效果了，虽然上面这么说得很顺，其实背地里建建删删搞了好几次，无法启动告终(`Error response from daemon: Cannot link to a non running container: /mysql AS /myadmin/db`，最终以`phpmyadmin`)。一通搜索，[遇事不决就重启](https://stackoverflow.com/questions/37413710/)解决了这个问题。。。

但是头铁显然是有代价的，一尝试登陆duang duang两条报错扔出来。

> mysqli_real_connect(): The server requested authentication method unknown to the client [caching_sha2_password]

> mysqli_real_connect(): (HY000/2054): The server requested authentication method unknown to the client

原来是MySQL8默认的身份验证换了一种全新的方法。一搜issue，都[一年](https://github.com/phpmyadmin/phpmyadmin/issues/14220)了，还是不支持可还行。

等他实现那要到什么时候，直接修改一下得了。

`docker exec -it mysql mysql -u root -p`

```sql
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '<PASSWORD>';
FLUSH PRIVILEGES;
```

其实我也搞不清为什么里面已经有两个root了，或许是镜像自带的？一个host是`localhost`另一个是`%`，于是我就唰唰地把`localhost`的那位给去了（反正除非从docker里进，其他都不算`localhost`了

然后，然后就可以正常登陆了

不管怎么说，至少现在可以正常访问数据库了，那么本文就暂且告一段落吧。
