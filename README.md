
./static => 这个不用多说，静态资源文件夹。抓取的图片也放在里面

./routes => 接口

./model =>三个js文件，主要是分别是采集图片的信息保存到mongoDB、查询DB下载图片、保存图片目录，作为对外接口的数据。其中保存图片目录的js其实可以和第一个合并，并不需要单独列出。（我每次保存都会先清空一下这个集合的文档，这样处理并不科学。不过这只是个练手的项目，所以无所谓啦）

./dev =>gulp源文件目录

./app.js =>启动node服务

至于gulpfile.js和package.js，不用我多说了吧。

注意：请先抓取图片。然后才会有后面的事

PS:数据采集对象:<a color="purple">mzitu.com</a>

