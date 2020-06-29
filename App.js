/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  Linking,
  PermissionsAndroid
} from 'react-native';

import {Colors,} from 'react-native/Libraries/NewAppScreen';
import ImagePicker from 'react-native-image-picker';

import {
  Grayscale,
  Sepia,
  Tint,
  ColorMatrix,
  concatColorMatrices,
  invert,
  contrast,
  saturate,
  DuoTone,
} from 'react-native-color-matrix-image-filters';

import PDFScanner from '@woonivers/react-native-document-scanner';

const {height, width} = Dimensions.get('window');

console.disableYellowBox = true;

async function GetAllPermissions() {
  try {
    if (Platform.OS == 'android' && Platform.Version > 22) {
      console.warn('grantif')
      const granted = await PermissionsAndroid.requestMultiple(
          [
              PermissionsAndroid.PERMISSIONS.CAMERA,
              PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          ]
      );
      console.log('permissionssss: ',granted)
      if (granted['android.permission.CAMERA'] != 'granted' || granted['android.permission.WRITE_EXTERNAL_STORAGE'] != 'granted') {
          console.warn('notgranted')
          return alert(strings['dontHavePermissionsToSelectImage'])
      }else{
        return true
      }
  }
} catch (err) {
    console.log(err);
  }
  return null;
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.isAndroid = Platform.OS ==='android'?true:false
    this.state = {
      enableKeyBoardAvoidingView: false,
      selectedFilterType: 0,
      isFilterShown: false,
      isDocumentPickerClicked: false,
      buttonText:'Take Picture',
      imagePath:
        'https://media-exp1.licdn.com/dms/image/C510BAQEuUe6RCa6vBQ/company-logo_200_200/0?e=2159024400&v=beta&t=Dxkqjg2Gmz8ZVorhYAXSvw3IP3TwsoyLTd8_Uv-1fAE',
    };
    GetAllPermissions()
  }

  chooseUserProfileLogo() {
    const options = {
      quality: 1.0,
      maxWidth: 400,
      maxHeight: 400,
      cropping:true,
      allowsEditing: true,
      storageOptions: {
        skipBackup: true,
      },
    };
    ImagePicker.showImagePicker(options, (response) => {
      console.log('Response = ', response);
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        let source = {uri: response.uri};
        this.setState({imagePath:source.uri,isFilterShown:true})
      }
    });
  }

  openImageCropPicker() {
    if(this.isAndroid){
      let ImageCropper = this.isAndroid? require('react-native-android-image-cropper'):null;
      let options = {
        guideLines: 'on-touch',
        cropShape: 'rectangle',
        title: 'Millipixles Cropper',
        cropMenuCropButtonTitle: 'Done',
      };
    
      ImageCropper.selectImage(options, (response) => {
        if (response && response.uri) {
          if(response.uri !==null){
            this.setState({imagePath: response.uri, isFilterShown: true});
          }else{
            this.setState({isFilterShown: true});
          }
        }
      });      return
    }

    let options = {}
    this.chooseUserProfileLogo(options)
  }
  openScannedImageCropper(imageUri){
    let ImageCropper = require('react-native-android-image-cropper');
    var options = {
      guideLines: 'on-touch',
      cropShape: 'rectangle',
      title: 'Millipixles Cropper',
      cropMenuCropButtonTitle: 'Done',
    };

    ImageCropper.startCropImageActivity(options,imageUri,(response) => {
      if (response && response.uri) {
        this.setState({imagePath: response.uri, isFilterShown: true});
      }
    })
  
}

  openDocumentScanner = () => {
    this.setState({selectedFilterType:0,isDocumentPickerClicked: true});
  };

  onTakePictureClick = () =>{
    this.setState({buttonText:'Processing...'})
  }

  onAutomaticDocumentDetection = imageUri =>{
    this.setState({buttonText:'Processing...',imagePath:imageUri.croppedImage,isDocumentPickerClicked:false,isFilterShown:true})
    this.openScannedImageCropper(imageUri.croppedImage)
  }

  onPickOrClickImage = () => {
    this.setState({selectedFilterType:0})
    this.openImageCropPicker()
  }

  render() {
    const {
      selectedFilterType,
      imagePath,
      isFilterShown,
      isDocumentPickerClicked,
      buttonText
    } = this.state;
    return (
      <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
        contentContainerStyle = {{paddingBottom:32,marginTop:16}}
        showsVerticalScrollIndicator={false}>

        {!isDocumentPickerClicked?

        <View style = {{width:'100%',alignItems:'center',justifyContent:'center',height:height}}>
        {selectedFilterType ===1?<GrayscaledImage
          imageUri={imagePath} />: selectedFilterType ===2?<SepiaImage imageUri = {imagePath}/>
          :selectedFilterType ===3?<TintImage imageUri = {imagePath} />:selectedFilterType ===4?<SaturateImage imageUri = {imagePath} />:
          selectedFilterType === 5? <DuoToneImage imageUri = {imagePath} />:
        <Image source = {{uri:this.state.imagePath}} style={styles.imageStyle}/>}
        <TouchableOpacity style = {[styles.bgButton,{alignItems:'center',marginTop:16}]}
        onPress = {() =>this.onPickOrClickImage()}>
        <Text style={[styles.sectionTitle]}>Pick or Click Image</Text>
        </TouchableOpacity>

        <TouchableOpacity style = {[styles.bgButton,{alignItems:'center',marginTop:8}]}
        onPress = {() =>this.openDocumentScanner()}>
        <Text style={[styles.sectionTitle]}>Document Scanner</Text>
        </TouchableOpacity>

        {isFilterShown?

        <>

        <Text style={[styles.sectionTitle,{marginTop:8,fontStyle:'italic'}]}>Apply Filter</Text>


        <View style = {{width:'80%',flexDirection:'row',justifyContent:'space-between',marginTop:16}}>
        <TouchableOpacity style = {styles.bgButton} onPress = {() =>this.setState({selectedFilterType:0})}><Text style={styles.sectionTitle}>Original</Text></TouchableOpacity>
        <TouchableOpacity style = {[styles.bgButton,{backgroundColor:'#D6DBDF'}]} onPress = {() =>this.setState({selectedFilterType:1})}><Text style={styles.sectionTitle}>Grayscale</Text></TouchableOpacity>
        </View>

        <View style = {{width: '80%',marginTop:16,flexDirection:'row',justifyContent:'space-between'}}>
        <TouchableOpacity style = {[styles.bgButton,{backgroundColor:'#F5CBA7'}]} onPress = {() =>this.setState({selectedFilterType:2})}><Text style={styles.sectionTitle}>Sepia</Text></TouchableOpacity>
        <TouchableOpacity style = {[styles.bgButton,{backgroundColor:'#F39C12'}]} onPress = {() =>this.setState({selectedFilterType:4})}><Text style={styles.sectionTitle}>Saturate</Text></TouchableOpacity>
        </View>
        <View style = {{width: '80%',marginTop:16,flexDirection:'row',justifyContent:'space-between'}}>
        <TouchableOpacity style = {[styles.bgButton,{backgroundColor:'#F1948A'}]} onPress = {() =>this.setState({selectedFilterType:5})}><Text style={styles.sectionTitle}>DuoTone</Text></TouchableOpacity>
        <TouchableOpacity style = {[styles.bgButton,{backgroundColor: 'rgba(245, 200, 255, 1)'}]} onPress = {() =>this.setState({selectedFilterType:3})}><Text style={styles.sectionTitle}>Tint</Text></TouchableOpacity>

        </View>
        </>
        :null}


        </View>
        : 
        <View style = {{height:height,width:width}}>
        <PDFScanner
          ref={ref => {
            this.pdfScannerElement = ref;
          }}
          style={styles.scanner}
          onPictureTaken={imageUri =>{
            this.onAutomaticDocumentDetection(imageUri)
          }
          }
          overlayColor="rgba(255,130,0, 0.7)"
          enableTorch={false}
          quality={0.5}
          detectionCountBeforeCapture={5}
          detectionRefreshRateInMS={50}
        />
        <TouchableOpacity onPress={()=>{this.onTakePictureClick()}} 
        style={styles.button}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
  }
        </ScrollView>

      </SafeAreaView>
      </>
    );


  }
}

export default App;

const GrayscaledImage = (imageProps) => (
  <Grayscale>
    <Image
      source={{uri: imageProps.imageUri}}
      style={styles.imageStyle}
    />
  </Grayscale>
);

const TintImage = (imageProps) => (
  <Tint amount={1.25}>
    <Sepia>
      <Image
        source={{uri: imageProps.imageUri}}
        style={styles.imageStyle}
      />
    </Sepia>
  </Tint>
);

const SepiaImage = (imageProps) => (
  <Sepia>
    <Image
      source={{uri: imageProps.imageUri}}
      style={styles.imageStyle}
    />
  </Sepia>
);

const DuoToneImage = (imageProps) => (
  <DuoTone secondColor="red">
    <Image
      source={{uri: imageProps.imageUri}}
      style={styles.imageStyle}
    />
  </DuoTone>
);

const SaturateImage = (imageProps) => (
  <ColorMatrix
    matrix={concatColorMatrices([saturate(-0.9), contrast(5.2), invert()])}
    // alt: matrix={[saturate(-0.9), contrast(5.2), invert()]}
  >
    <Image
      source={{uri: imageProps.imageUri}}
      style={styles.imageStyle}
    />
  </ColorMatrix>
);

const styles = StyleSheet.create({
  scanner: {
    flex: 1,
    aspectRatio: undefined,
  },
  button: {
    alignSelf: 'center',
    position: 'absolute',
    bottom: 32,
  },
  buttonText: {
    backgroundColor: 'rgba(245, 252, 255, 0.7)',
    fontSize: 32,
    padding:8
  },
  preview: {
    flex: 1,
    width: '100%',
    resizeMode: 'cover',
  },
  permissions: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.black,
  },
  bgButton:{
    borderRadius:4,
    borderWidth:1,
    padding:4,

  },
  imageStyle:{
    height:200,
    width:200,
    borderRadius:8,
  }
});
