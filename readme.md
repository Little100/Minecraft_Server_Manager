# Minecraft Server Manager [WebUI]

- **项目简介**：这是一个由两名高二学生(2024起)，和其他我的世界的爱好者(截止到2025/2/7还没有其他人)制作的用于管理Minecraft服务器的Web图形化界面(现在仍在开发中)。
- 最大的亮点可能就是自带一个公网IP服务...?
- **开发框架**：项目使用了Python的Flask框架进行开发。
- **项目理念**：由于是高中生的作品，我们的目标是“能用就行”，并不追求过于复杂的功能。
- **公网IP提供**：公网IP服务是由项目总开发自己购买的,不过延迟可能较大,也算是临时的一个解决方案。
  - **[注意]: frp服务器有三个 由于都不是国内的 所以延迟可能较高 只能做临时使用 不过我们不会限制时间 三台服务器分别在[日本(5Gbps带宽),[新加坡(1Gbps带宽)],[香港(5Gbps带宽)]]**
> 但由于高二，空闲时间少之又少，后续可能开发一体式带GUI的轻量级本地服务器管理客户端，也有可能不会开发。

## 注意
 - 我们虽然提供内网穿透服务 同时公开允许所有人使用
 - 我们希望我们的项目会给大家提供便利 同时所有人都可以用我们云服务器干一些事情
 - 但是请做到以下几点 感谢
 - **1.不要滥用我们的云服务器(比如pcdn,或者代理一些奇怪的网站之类的)**
 - **2.不要以任何形式将我们免费的内网穿透服务做成付费的服务**
 - **3.不要将我们的云服务器做成任何形式的商业用途**
 - **5.不要将我们的云服务器用于任何非法用途**
 - 请做到以上几点 如果发现了以上行为请及时联系我们 届时我们将继续修改源代码 不会再将我们的云服务器的frps公开透明 但是我们仍然会提供免费的公网服务 希望大家能理解 并且尊重我们的劳动成果 谢谢

## 所需要的库(编译好的exe不需要)
```python
pip install pyyaml
pip install flask
pip install psutil
pip install requests
pip install flask_cors
pip install Flask Flask-Login
pip install Flask-SQLAlchemy
pip install Flask-Session
pip install chardet
pip install Flask-Migrate
pip install flask_socketio
```

## 鸣谢列表
 - Little_100(总制作人)[[主页]](https://github.com/little100)
   - html, py, frp
     - 感谢部分人的精神支持.......
 - Mivez(核心检测编写)[[主页]](https://github.com/Mivez)
   - corechecker.yml

## 请注意
 - 如果您修改了我们的程序导致了一些问题
 - 或者如果泄露密码等
 - 我们概不负责！

## 许可证

- 本项目采用 [Creative Commons Attribution-NonCommercial (CC BY-NC)](https://creativecommons.org/licenses/by-nc/4.0/) 许可证。
