---
layout:     post
title:      "使用Let's Encrypt为Windows RDP服务提供有效证书"
subtitle:   "写于证书续命成功之后"
date:       2020-08-27
author:     "TautCony"
header-img: "img/post-bg-default.png"
image:
  credit: himawari-8
  creditlink: http://himawari8.nict.go.jp/
tags:
    - 网络
catalog: true
---

本文将介绍如何摆脱自签证书在每次远程连接时对用户的摧残并提升安全性。

<!--more-->

周知，使用RDP连接电脑都会遇到一个“无法验证此远程计算机的身份，是否仍要连接”的警告提示。

虽然它也提供了一个“不再询问我是否连接到此计算机”的选项，但这不是相当于自欺欺人么，而且这确实使得无法方便得确认服务器的真实身份，存在一定的风险隐患。

说起来步骤也不困难，也就如下三步（说的好像把大象装进冰箱一样）：

- 如何申请证书
- 如何安装证书
- 如何配置证书

## 申请证书

本文将使用`Let's Encrypt`进行申请，免费虽然是它的一个主要原因，但是更为重要的是，它提供的[`Certbot`](https://certbot.eff.org/)支持多种认证方式。

#### 配置域名

以Cloudflare为例，配置形如下表，由于显然不需要它提供的减速CDN，需要将`Proxy status`设置为`DNS only`，IP根据实际情况配置即可，公网内网均可。

![DNS配置](/img/in-post/letsencrypt-for-rdp/dns-config.png)

#### 获取证书

使用RDP的设备往往并不具有公网IP，就算使用了端口映射等方式配置了，家宽显然无法使用80端口来进行验证。

`Certbot`除了`HTTP-01 challenge`以外，还以插件的形式提供了[多个](https://certbot.eff.org/docs/using.html#dns-plugins)`DNS-01 challenge`，它通过调用DNS解析商的API来向对应域名中的DNS添加TXT记录以实现认证。只要域名解析商支持，就能在任意网络中申请到证书。

1) 请确认本地已经具备Python环境，然后在终端中执行`pip install certbot certbot-dns-cloudflare`以进行安装。如果是其他DNS解析商，请参见上面的链接更改，并且后续的`Certbot`配置就不那么具备参考意义的，请参见对应的文档。

2) 到[这里](https://dash.cloudflare.com/?to=/:account/profile/api-tokens)新建一个具有对应域名的`Zone:DNS:Edit`权限的API Token，记得及时保存token，页面退出后就没有机会查看只能重新创建了，创建完大致长这样：![Api Token](/img/in-post/letsencrypt-for-rdp/api-token.png)

3) 创建配置文件`cloudflare.ini`，配置文件内容形如下：

```ini
# Cloudflare API token used by Certbot
dns_cloudflare_api_token = ZheLiCloudflareAPITokenDeChangDuShi40Wei
```

请注意理论上该文件应仅能被自己查看，请根据需求配置文件属性并不要上传到任何公开场所，否则任何获取到的人都能随意修改你的DNS配置（以上一步创建时授予的权限为限）。

4) 执行形如此的指令以申请证书，请注意修改域名：`certbot certonly --dns-cloudflare --dns-cloudflare-credentials cloudflare.ini --dns-cloudflare-propagation-seconds 60 -d YOUR.DOMAIN.COM --debug`

若成功则可在`C:\Certbot\live\YOUR.DOMAIN.COM`下收割新建的证书，会有如下4个文件。
```
cert.pem
chain.pem
fullchain.pem
privkey.pem
```

## 安装并配置证书

由于Windows中安装证书，需要的格式为`PKCS #12`，后缀为`.pfx`的二进制文件将同时包括共钥和私钥，同时需要密码保护。所以上述操作中获取的为`.pem`文本格式文件需要进行一个转换操作。安装完成后，则需要在注册表中对RDP配置其所使用的证书的摘要才能真正在RDP中使用该证书。

证书相关的操作，显然需要`openssl`登场，说起来`openssl`还挺扭曲的，自己完全不提供预编译的二进制文件，仅在[wiki中](https://wiki.openssl.org/index.php/Binaries)列了一些第三方提供的预编译文件并付了个免责声明了事，所以这里也请自行选择下载。

假定`openssl`的执行文件位于如下路径`.\openssl\x64\bin\openssl.exe`，可以使用如下的powershell脚本将转换和安装工作自动化，请注意更改域名变量，而不是对着GUI一通点，对着注册表编辑器一通编辑，由于转换过程中的密码在证书安装后就没有用处了，故脚本中为随机生成并仅在终端中输出一次。

```powershell
Function Get-RandomAlphanumericString {
	[CmdletBinding()]
	Param (
        [int] $length = 8
	)

	Begin{
	}

	Process{
        Write-Output ( -join ((0x30..0x39) + ( 0x41..0x5A) + ( 0x61..0x7A) | Get-Random -Count $length  | % {[char]$_}) )
	}
}


$domain = "YOUR.DOMAIN.COM"
$password = Get-RandomAlphanumericString(16)
$certName = "certificate.pfx"

[System.Console]::WriteLine([System.String]::Concat("Password for pfx is: ", $password))

# convert cert
.\openssl\x64\bin\openssl.exe pkcs12 -export -out $certName -inkey C:\Certbot\live\$domain\privkey.pem -in C:\Certbot\live\$domain\cert.pem -certfile C:\Certbot\live\$domain\chain.pem -password pass:$password
# import cert
certutil.exe -p $password -importPFX $certName noExport
# get digist
$tp = (ls Cert:\LocalMachine\my | WHERE {$_.Subject -match "$domain" } | Select -First 1).Thumbprint
# apply cert
& wmic /namespace:\\root\CIMV2\TerminalServices PATH Win32_TSGeneralSetting Set SSLCertificateSHA1Hash="$tp"
```

建议打开一个终端后再执行脚本文件，以免出现报错都来不及看。

完成以上操作后，即可使用域名进行RDP连接，理论上即可看到一个喜人的小🔒。

此时如果重新使用IP进行连接访问，则将显示成如下形式：
![名称不匹配](/img/in-post/letsencrypt-for-rdp/domain-not-match.png)

## 更新证书

`Let's Encrypt`提供的证书有效期仅3个月，在到期前使用`certbot renew`对证书进行更新并重新执行上述powershell脚本即可。

## TODO: 完全自动化

当前尚缺一个定时任务将更新与安装的操作完全自动化，现方案更新证书仅需几次鼠标双击，仍在可接受范围之内，暂且搁置计划。
