## 配置
当前代码需要配置PromptAI的发布项目使用， 在PromptAI中编辑完流图/FAQ后进行发布，发布成后后会看到相关参数。

这里以"移动端链接"为例进行配置：
```text
https://app.promptai.cn/ava/?name=Prompt+AI&id=a1_p_c4c9iurlzdhc&token=YjhiZDRhOWMtNDhlMi00NWVjLTgxMWMtZGNjODU2NjRhYWRh&project=p_c4c9iurlzdhc
```
链接中有三个参数分别与config.js 对应
 - id     
 - token   
 - project 
 - baseURL : 这里使用 https://app.promptai.cn，此处只需要: 协议://host+port 即可


config.js还有其他的可选配置项：
- wakeWords : 类型：数组。 如果不配置，用户只能通过@扫码登录的微信账户，且在群中不能加昵称。 唤醒词无需@，使用：唤醒词+问题 即可。
- fallback  : 当交互失败时自定义回复。



## 启动

``` shell
# 第一次启动需要先安装依赖
yarn install
# 启动
yarn start
```
然后微信扫描命令行输出的二维码登录


## 其他
1、如果其他需求或疑问，请访问官网：https://promptai.cn 获取帮助。
