---
id: 02-story-generation
title: 02 故事编写
sidebar_label: 02 故事编写
---
### 必须申请的API

1. **OpenAI API**（用于生成字幕、脚本、图像prompt）
2. **Flux图像生成**（实际通过**fal.ai** 或 **PiAPI** 提供，2026年最常用fal.ai或PiAPI）
3. **Kling AI视频生成**（图像转视频，通过**PiAPI** 或 **fal.ai** 访问，Kling官方无直接公开API）
4. **ElevenLabs API**（英文语音配音，支持童声）
5. **Creatomate API**（视频最终合成：添加模板、过渡、字幕、合并音频视频）

### 1 OpenAI API

访问：[https://platform.openai.com/signup](https://platform.openai.com/signup?referrer=grok.com)
（或直接 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys?referrer=grok.com)）
- 步骤：
    1. 用邮箱/手机注册或登录。
    2. 左侧菜单 > API keys > Create new secret key。
    3. 复制key（sk-开头，只显示一次）。
    4. 添加支付方式（新用户有$5-18免费信用）。
- 成本：gpt-4o-mini很便宜，生成一个故事脚本~0.01元。


Google Gemini API（通过Google AI Studio）申请非常简单，免费，新用户有慷慨的免费额度。

访问Google AI Studio，直接打开 https://aistudio.google.com/app/api-keys 

页面左侧菜单或顶部点击“Get API key” / “Create API key”，选择已有项目或新建一个，点击“Create API key”，key立即生成（以 AIza 开头的一长串字符串）。

![](../../../static/img/Pasted%20image%2020260102135819.png) 

复制并安全保存key。


### 2 PiAPI

![](../../../static/img/Pasted%20image%2020260102114215.png)

- 访问：[https://piapi.ai/](https://piapi.ai/?referrer=grok.com)（或 [https://piapi.ai/signup](https://piapi.ai/signup?referrer=grok.com)）
- 步骤：
    1. 注册账号（邮箱或Google登录）。
    2. 登录后 > Dashboard > API Keys > Generate new key。
    3. 复制key。
    4. 新用户通常有免费信用（几十个生成）。充值按需（Flux ~0.02美元/图，Kling ~0.3-0.5美元/5秒视频）。
- 优势：n8n社区有专用PiAPI节点，模板可能已支持；支持seed参数（角色一致性）。





![](../../../static/img/Pasted%20image%2020260102134823.png)





### 3 Flux图像生成
实际通过fal.ai 或 PiAPI 提供，2026年最常用fal.ai或PiAPI

- Flux + Kling 最稳定方式是用 **PiAPI**（一个平台统一提供Flux和Kling，按使用付费，有免费信用）。或者用 **fal.ai**（也支持Flux和Kling部分模型）。
- 如果用PiAPI，一个API key就能搞定Flux + Kling，简化配置。



### 4 Kling AI视频生成
图像转视频，通过PiAPI 或 fal.ai 访问，Kling官方无直接公开API

### 5 ElevenLabs API 

功能：生成童声配音。

ElevenLabs是一家领先的AI音频研究公司，成立于2022年，总部位于纽约，专注于开发自然逼真的语音合成（Text-to-Speech, TTS）技术，使用深度学习让AI语音具备情感、语调和上下文理解能力，常被誉为“最接近人类的AI语音生成器”。

这里我的需求是生成英文语音配音，支持童声，用ElevenLabs是最佳选择。

访问：[https://elevenlabs.io/](https://elevenlabs.io)

在Voices页面可以试听，选择儿童声线如"Matilda"、"Josh"或搜索"child"，可以挨个点击试听一下看看效果。

![](../../../static/img/Pasted%20image%2020260102131039.png)

用邮箱注册，或者google账号登录。

左下角点击 Developers > Api Keys > Create Keys。

![](../../../static/img/Pasted%20image%2020260102125527.png)

在新建API key界面，可以看到各个功能的权限级别（Permissions/Scope），默认大多是“No Access”，你需要手动切换到“Access”或“Read/Write”来启用。

**Text to Speech → Access** （核心！这是调用/v1/text-to-speech endpoint生成音频的权限。没有这个，什么都生成不了。）

**Voices → Read** （必须！用于获取voices列表，找到童声的voice_id，如Matilda或Josh。没有Read，无法指定或列出可用声音。Write不需要，除非你想添加/修改声音。）

**Voice Generation → Access** （推荐启用，许多教程提到TTS需要这个，可能与某些模型或生成相关。安全起见，打开。）

**User → Read** （推荐，用于检查quota/剩余字符，避免超支错误。Write不需要。）

![](../../../static/img/Pasted%20image%2020260102130236.png)

新建后，复制key（以sk_开头），注意保存，只能在创建的时候看到。

![](../../../static/img/Pasted%20image%2020260102130323.png)

关于API的收费，用户每个月有免费额度，每月1万字符，够生成几十个短视频配音。

如果需要大批量制作，再选择按需开通会员。

![](../../../static/img/Pasted%20image%2020260102125608.png)



### 6 Creatomate API 

功能：视频最终合成，添加模板、过渡、字幕、合并音频视频

Creatomate 是一个强大的云端视频与图像自动化渲染平台（API for Automated Video Generation），专为开发者、无代码用户和自动化工作流设计。它允许你通过可复用模板批量生成专业级的短视频、社交媒体内容（如YouTube Shorts、TikTok、Instagram Reels）、广告banner或个性化视频，而无需手动编辑。

![](../../../static/img/Pasted%20image%2020260102132145.png)


访问：[https://creatomate.com](https://creatomate.com)，可以选择google账号登录。

Creatomate API 不能直接渲染视频，必须先创建一个可复用的视频模板（Template），然后在API调用时指定Template ID，并传入动态数据（如图像URL、音频URL、文字等）。没有模板，就无法生成视频。

登录后，进入 Template，点击"New"。

![](../../../static/img/Pasted%20image%2020260102132624.png)

选择quick promo，格式推荐Vertical (9:16) for TikTok/Shorts。

![](../../../static/img/Pasted%20image%2020260102132645.png)

![](../../../static/img/Pasted%20image%2020260102132736.png)

选择 Use Template > API Integration

![](../../../static/img/Pasted%20image%2020260102132827.png)

保存改模板API相关信息，后续会用到。

![](../../../static/img/Pasted%20image%2020260102132936.png)

模板做好后，n8n工作流就能动态填充AI生成的内容，渲染最终1分钟卡通视频。

一般注册后会自动送50 credits，够渲染几十个短视频测试。

如果是批量制作，可以选择对应的会员套餐。

![](../../../static/img/Pasted%20image%2020260102134020.png)


