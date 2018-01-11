[React Native][rn]中使用的尺寸单位是dp(一种基于屏幕密度的抽象单位。在每英寸160点的显示器上，1dp = 1px),而设计师使用的是px, 这两种尺寸如何换算呢？官方提供了[PixelRatio][1]:
```javascript
import {PixelRatio} from 'react-native';
const dp2px = dp=>PixelRatio.getPixelSizeForLayoutSize(dp);
const px2dp = px=>PixelRatio.roundToNearestPixel(px);
```
设计师给你一个尺寸，比如100px*200px的View，按照下面的方式可实现设计还原：
```javascript
<View style={{width:px2dp(100),height:px2dp(200),backgroundColor:"red"}}/>
```
这个时候，你或许会说，这也太麻烦了，每个有尺寸的地方我都得转么，能不能我直接用px写，当然可以，不过需要整体加个缩放系数：
```
import {PixelRatio,Dimensions}} from 'react-native';
const dp2px = dp=>PixelRatio.getPixelSizeForLayoutSize(dp);
const px2dp = px=>PixelRatio.roundToNearestPixel(px);

let pxRatio = PixelRatio.get();
let {win_width,win_height} = Dimensions.get("window");

let scale = 1/pxRatio;
let width = dp2px(win_width);
let height = dp2px(win_height);
const com = props=>(
                <View sytle={styles.container}>
                    <View style={{width:100,height:200,backgroundColor:"red"}}/>
                </View>)

const styles={
  container: {
		width:width,
		height:height,
		transform:[{translateX:-width*.5},
					{translateY:-height*.5},
					{scale:scale},
					{translateX:width*.5},
					{translateY:height*.5}]
	},
}
```
这样处理后，在根节点内，你再也不用考虑dp的问题了，直接使用px即可。
不过此时还有另外一个问题，设计尺寸是死的，屏幕大小是活的，得考虑分辨率适配啊，那在不同的分辨率下如何正确的实现设计师的设计呢？

我们将使用一种游戏经常会用到得方案，fixedWidth/fixedHeight.
>###fixedWidth
fixedWidth 模式是保持原始宽高比缩放应用程序内容，缩放后应用程序内容在水平和垂直方向都填满播放器窗口，但只保持应用程序内容的原始宽度不变，高度可能会改变,简言之**宽度固定，高度自适应**。

>###fixedHeight
fixedHeight 模式是保持原始宽高比缩放应用程序内容，缩放后应用程序内容在水平和垂直方向都填满播放器窗口，但只保持应用程序内容的原始高度不变，宽度可能会改变,简言之**高度固定，宽度自适应**。

具体如何应用呢，别急，一步步来。
先来看看如何得到屏幕的像素宽高：
```javascript
import {Dimensions,PixelRatio} from 'react-native';

let {width,height} = Dimensions.get("window");
let w =dp2px(width);
let h = dp2px(height);
```
假定我们的设计尺寸是 
```
let designSize = {width:750,height:1336};
```
按照fixedWidth、fixedHeight的定义，我们计算下新的宽高：
```
//fixedWidth
let scale = designSize.width/w;
let winSize = {width:designSize.width,height:h*scale};

//fixedHeight
let scale = designSize.height/h;
let winSize = {width:designSize.width*scale,height:designSize.height};

```
这个winsize就是最终实际用来布局的屏幕尺寸,此时我们又会多了一个分辨率适配的缩放系数，还记得我们前一个我们添加的为了使用px的缩放系数么，我们在这里做一个整合：

```
import {PixelRatio,Dimensions}} from 'react-native';
const dp2px = dp=>PixelRatio.getPixelSizeForLayoutSize(dp);
const px2dp = px=>PixelRatio.roundToNearestPixel(px);

let designSize = {width:750,height:1336};

let pxRatio = PixelRatio.get();
let {win_width,win_height} = Dimensions.get("window");

let width = dp2px(win_width);
let height = dp2px(win_height);

let design_scale = designSize.width/width;
height = height*design_scale

let scale = 1/pxRatio/design_scale;

const com = props=>(
                <View sytle={styles.container}>
                    <View style={{width:100,height:200,backgroundColor:"red"}}/>
                </View>)

const styles={
  container: {
		width:width,
		height:height,
		transform:[{translateX:-width*.5},
					{translateY:-height*.5},
					{scale:scale},
					{translateX:width*.5},
					{translateY:height*.5}]
	},
}
```

在后续的开发中将不必再关注适配的问题，只需要按照设计师给的尺寸实现布局即可。

最后再附上一个工具类 Resolution.js：
```
import React, {Component, PropTypes} from 'react';
import {
	Dimensions,
	PixelRatio,
	Platform,
	StatusBar,
	View
} from 'react-native';

let props = {};
export default class Resolution {
	static get(useFixWidth = true){
		return useFixWidth?{...props.fw}:{...props.fh}
	}

	static setDesignSize(dwidth=750,dheight=1336,dim="window"){
		let designSize = {width:dwidth,height:dheight};

		let navHeight = Platform.OS === 'android' ? StatusBar.currentHeight : 64;
		let pxRatio = PixelRatio.get(dim);
		let {width,height} = Dimensions.get(dim);
		if(dim != "screen")height-=navHeight;
		let w = PixelRatio.getPixelSizeForLayoutSize(width);
		let h = PixelRatio.getPixelSizeForLayoutSize(height);

		let fw_design_scale = designSize.width/w;
		fw_width = designSize.width;
		fw_height = h*fw_design_scale;
		fw_scale = 1/pxRatio/fw_design_scale;

		let fh_design_scale = designSize.height/h;
		fh_width = w*fh_design_scale;
		fh_height = designSize.height;
		fh_scale = 1/pxRatio/fh_design_scale;

		props.fw = {width:fw_width,height:fw_height,scale:fw_scale,navHeight};
		props.fh = {width:fh_width,height:fh_height,scale:fh_scale,navHeight};
	}

	static FixWidthView = (p) => {
		let {width,height,scale,navHeight} = props.fw;
		return (
			<View {...p} style={{
											marginTop:navHeight,
											width:width,
											height:height,
											backgroundColor: 'transparent',
											transform:[{translateX:-width*.5},
														{translateY:-height*.5},
														{scale:scale},
														{translateX:width*.5},
														{translateY:height*.5}]
										}}>
			</View>
		);
	};

	static FixHeightView = (p) => {
		let {width,height,scale,navHeight} = props.fh;
		return (
			<View {...p} style={{
											marginTop:navHeight,
											width:width,
											height:height,
											backgroundColor: 'transparent',
											transform:[{translateX:-width*.5},
														{translateY:-height*.5},
														{scale:scale},
														{translateX:width*.5},
														{translateY:height*.5}]
										}}>
				{p.children}
			</View>
		);
	};
};
//init
Resolution.setDesignSize();




```
How to use:
```
import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  Image,
  View
} from 'react-native';

import Resolution from "./Resolution"

export default class tets extends Component {
  render() { 
    return (
      <Resolution.FixWidthView style={styles.container}>
        <Image source={require("./assets/bg_day.jpg")} style={{position:"absolute"}}/>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+D or shake for dev menu
        </Text>
      </Resolution.FixWidthView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#ff0000',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
    backgroundColor:"transparent"
  },
  instructions: {
    backgroundColor:"transparent",
    textAlign: 'center',
    color: 0xffff,
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('rn_resolution', () => tets);

```
bg_day.jpg的尺寸是750*1500，上面的程序在所有的分辨率下图片都能正确显示。

另外：不同分辨率下背景图片尺寸如何选择，移步另一篇博文：[《分辨率适配的取值范围》](http://www.jianshu.com/p/b4bfc7ba11b0)


[rn]:http://facebook.github.io/react-native/
[1]:https://facebook.github.io/react-native/docs/pixelratio.html
[rn_resolution]:https://github.com/TerranTian/rn_resolution