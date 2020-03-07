---
layout:     post
title:      "使用git-secret对仓库中的文件进行加密"
subtitle:   ""
date:       2020-03-07
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - Git
    - GPG
    - 加密
---

最近试着用beancount进行记账，但是却对这纯明文的账本怎么备份有点头疼。

<!--more-->

虽然一系列访问限制好加，但是单单本机存储总还是有点心慌，用加密的压缩包虽然能解决一部分问题，但这对版本管理是极为不利的，这一点应该还是不能退让的。

那么如果使用git进行版本管理，就算是私有仓库，直接上传的话感觉也是不大可取，四处搜索了一下，[`git-secret`](https://git-secret.io/)似乎能够满足需求，大致看了一下，还是比较轻量的，相当于是写了一组脚本让加密变得更为便捷。那么就试着来配置一下吧。

## 准备工作

由于`git-secret`是基于`bash`和`GPG`的工具，所以Windows显然就无缘了，`GPG`现在在各大发行版中应该都已经内置，如果没有可使用对应的包管理工具进行安装。

使用对应包管理工具安装`git-secret`即可开始使用，更多信息详见[这里](https://github.com/sobolevn/git-secret#installation)。

```bash
$ sudo apt install git-secret
```

## 生成GPG密钥

首先需要的配料是GPG密钥，什么是GPG密钥可以到[这里](https://zh.wikipedia.org/wiki/GnuPG)进行了解，由于Github种对提交的签名使用的也是GPG密钥，所以，生成的步骤可以看[这里](https://help.github.com/cn/github/authenticating-to-github/generating-a-new-gpg-key)，本文就不进行赘述了。

一旦生成完成，可以使用如下命令对GPG密钥进行检查：
```bash
$ gpg --list-secret-keys --keyid-format LONG
/home/username/.gnupg/pubring.kbx
sec   rsa4096/YYYYYYYYYYYYYYYY 1926-08-17 [SC] [expires: ????-??-??]
      XXXXXXXXXXXXXXXXXXXXXXXXYYYYYYYYYYYYYYYY
uid                 [ unknown] username <username@email.com>
ssb   rsa4096/ZZZZZZZZZZZZZZZZ 1926-08-17 [E] [expires: ????-??-??]
```


## 初始化仓库

```bash
$ git init # 初始化git仓库
$ git secret init # 初始化git-secret
```

以上操作完成后，该目录下就会多出两个文件夹`.git`, `.gitsecret`，同时`git-scret`会创建`.gitignore`将`.gitsecret/keys/random_seed`排除。

`.gitsecret`为`git-secret`所使用的各项配置信息，为后续的使用，务必将其也检入。

然后将自己的GPG密钥作为本仓库所使用的加密密钥，使用如下格式的指令进行配置

```bash
$ git secret tell username@email.com # 配置加密所使用的密钥，请确保邮箱对应
gpg: keybox '/home/username/repo/.gitsecret/keys/pubring.kbx' created
gpg: /home/username/repo/.gitsecret/keys/trustdb.gpg: trustdb created
done. username@email.com added as someone who know(s) the secret.
cleaning up...
```

可以使用如下指令进行查看当前使用了哪些用户的密钥
```bash
$ git secret whoknows
username@email.com
```

可见，当前只有一个人能够解密，`git-secret`支持复数个人对该加密文件进行访问，大致上就是通过导入其他人的公钥再进行加密，不论是添加还是删除，都需要重新执行加密操作，否则是不会生效的。

## 添加文件

需要进行版本管理但不需要加密的，如脚本、配置文件，无需特殊操作，`git add`即可。

对于需要进行版本管理同时需要加密的，在本文中，即账本，由于其明文文件仅会在本地出现，故使用`.gitignore`进行排除。

使用`git secret add`添加需要加密的**文件**（不支持添加文件夹），若`.gitignore`中未正确配置，`git-secret`将会报错：`these files are not ignored: filename.ext ; abort.`。成功添加后，`git-secret`会在`.gitsecret\paths\mapping.cfg`进行记录。
```bash
$ git secret add test.beancount
1 item(s) added.
```


最后，使用`git secret hide`对文件进行加密，此时，被加密的文件会在对应的路径下多出一个追加了`.secret`后缀的文件。
```bash
$ git secret hide
done. all 1 files are hidden.
$ ls
test.beancount test.beancount.secret
```

## 检入文件

这时候就能将变更检入了，检入就不赘述了。

既然都费了好大劲配置了GPG密钥了，那么对commit也签个名吧，官方指南可以参见[这里](https://git-scm.com/book/zh/v2/Git-%E5%B7%A5%E5%85%B7-%E7%AD%BE%E7%BD%B2%E5%B7%A5%E4%BD%9C)。

由于本地配置时使用的是`WSL`，对commit的签名出了点意料外的问题，尝试签名会提示：
```
$ git commit -S -m "init commit"
error: gpg failed to sign the data
fatal: failed to write commit object
```

一通搜索发现是一个微小的配置问题，使用`echo "test" | gpg --clearsign`可以进行验证，此时输出：
```
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA512

test
gpg: signing failed: Inappropriate ioctl for device
gpg: [stdin]: clear-sign failed: Inappropriate ioctl for device
```

大致上就是它没法让你同GPG进行交互了，使用如下指令对GPG进行配置，若需要的话，可以将该指令追加到`.bashrc`中便于使用。
```bash
export GPG_TTY=$(tty)
```

## 同步仓库

在经历一通操作之后，就可以把它同步到任意一个私有仓库中即可，自建或者薅资本主义的羊毛，任君选择。

## 文件的解密与更新

如果是从其他机器上进行拉取需要对文件进行解密的话，需要在这台电脑上正确导入GPG密钥然后再使用`git secret reveal`进行解密。

## 需要注意的事项

- 如果这些文件出现了路径变更等操作的话，需要手动去`.gitsecret\paths\mapping.cfg`进行修改。
- 每次执行`git secret hide`，所有被`git-secret`追踪的文件都会重新加密一次，如果考虑到人员的增删是不是基于文件进行追踪的，那这样也还行。
- 由于存在历史版本，就算后期对某个用户进行移除，曾经用该用户的公钥进行加密的文件依然能够访问。当某一天第一步生成的GPG公钥失效并且被删除的话，那么历史记录里的文件就再也无法解密了。
