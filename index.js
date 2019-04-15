const fs = require('fs')
const dialog = require('electron').remote.dialog
const ipc = require('electron').ipcRenderer

let AsyncMessage=()=> {
  ipc.send('message', 'ping')
  ipc.on('reply', (event, arg) => {
    console.log(arg)
  })
}

let mainPath = dialog.showOpenDialog(null, {
  properties: ['openDirectory'],
  title: 'Select music file',
});
mainPath = mainPath[0]

let musicPathList = {}
let musicPathListLength = -1
let playList = {}
let nowPlaying = "musicId0"
let maxMusicId = "musicId0"
let random = false
let repeat = false

const searchMusicPath = (dirPath,num)=>{
  num++
  for(let i of fs.readdirSync(dirPath)){
    let hitPath = `${dirPath}/${i}`
//    console.log(hitPath)
    try{
      fs.statSync(hitPath)
    }catch(e){
      continue
    }
    if(fs.statSync(hitPath).isFile() && !fs.statSync(hitPath).isDirectory()){
      if(hitPath.match(/\.mp3/)){
        musicPathListLength++
        let musicId = `musicId${musicPathListLength}`
        musicPathList[musicId]=({musicId:musicId,path:hitPath})
      }
    }
    if(!fs.statSync(hitPath).isFile() && fs.statSync(hitPath).isDirectory()){
      if(num<4)searchMusicPath(hitPath,num)
    }
  }
  return
}
searchMusicPath(mainPath,0)
//console.log(musicPathList)


let directoryList = []
for(let i in musicPathList){
  maxMusicId = i
  playList[i] = musicPathList[i]
  if(i=="length")continue
  i=musicPathList[i]
  let dir = i.path.split("/")
  let fileName = dir.pop()
  dir=dir.join("/")
  dir = dir.replace(mainPath,"")
  if(dir=="")dir = "/"
  let num = null
  for(let ii=0;ii<directoryList.length;ii++){
    if(directoryList[ii]===dir){
      num = ii
      break
    }
  }
  if(num==null){
    directoryList.push(dir)
    num=directoryList.length-1
    $('#musicSelectArea').append(`<div id="classmusicList${num}" class="musicListTitle" >${dir}</div><div id="musicList${num}"></div>`)
  }
  $(`#musicList${num}`).append(`
  <div id="${i.musicId}" class="musicSelect">
    <span class="musicSelectTitle">${fileName}</span>
  </div>`)
}

$('.musicSelect').click(function (){
  if(playList[this.id]){
    delete playList[this.id]
    $(this).css('background-color','rgb(170, 170, 170)');
    $(this).css('color','white');
}else{
    playList[this.id] = musicPathList[this.id]
    $(this).css('backgroundColor','transparent')
    $(this).css('color','black')
  }
  console.log(playList)
})

$(".musicListTitle").click(function (){
  $(`#${this.id.replace(/^class/,"")}`).stop().slideToggle()
})

//////////////////////////////////////////////////////////////////////////////////////////////

let audio = new Audio
audio.controls = true

let audioStatus = {
  "play":false,
  "title":null,
}

audio.src = playList["musicId0"].path//6

$('#pausePic').fadeOut('0')
$('#loop1Pic').fadeOut('0')

const makeMinuteText = seconds =>{
  let ans = 0
  seconds = Math.floor(seconds)
  while (60<=seconds) {
    ans++
    seconds -= 60
  }
  seconds += ""
  if(seconds.length==1) seconds = `0${seconds}`
  ans += `:${seconds}`
  return ans
}

const audioSetup = ()=>{
  audioStatus.title = decodeURI(audio.src.split('/')[audio.src.split('/').length-1].replace(/\..+/,""))
  $('#audioTitle').text(audioStatus.title)
  $('#audioCurrentTime').text(makeMinuteText(audio.currentTime))
  $('#audioDurationTime').text(makeMinuteText(audio.duration))
}

const audioStart = ()=>{
  audioSetup()
  audio.play()
  audioStatus.play = true
  $('#pausePic').fadeIn('100')
  $('#playPic').fadeOut('100')

}
const audioStop = ()=>{
  audio.pause()
  audioStatus.play = false
  $('#pausePic').fadeOut('100')
  $('#playPic').fadeIn('100')
}
const audioSkip = ()=>{
  let n = nowPlaying.replace(/musicId/,"")
  n =  n*1
  while(true){
    n++
    if(playList[`musicId${n}`]){
      nowPlaying = `musicId${n}`
      audio.src = playList[nowPlaying].path
      break
    }else if(maxMusicId.replace(/musicId/,"")*1<n){
      n = -1
    }
  }
}
const audioBack = ()=>{
  let n = nowPlaying.replace(/musicId/,"")
  n =  n*1
  while(true){
    n--
    if(playList[`musicId${n}`]){
      nowPlaying = `musicId${n}`
      audio.src = playList[nowPlaying].path
      break
    }else if(n<0){
      n = maxMusicId.replace(/musicId/,"")*1+1
    }
  }
}
const audioRandom = ()=>{
  let list = []
  for(let i in playList){
    list.push(i)
  }
  nowPlaying = list[Math.floor(Math.random()*list.length)]
  audio.src = playList[nowPlaying].path
}

$('#playButton').click(function(){
  if(audioStatus.play){
    audioStop()
  }else{
    audioStart()
  }
})
$('#stopButton').click(function(){
  audioStop()
  audio.currentTime = 0
})

document.getElementById('volumeInput').oninput = (()=>{
  audio.volume = document.getElementById('volumeInput').value/100
  $('#volume').text(Math.floor(audio.volume*100))
})

$('#seekbackButton').click(function(){
  audio.currentTime -= 10
})
$('#seekskipButton').click(function(){
  audio.currentTime += 10
})
$('#trackskipButton').click(function(){
  audioSkip()
  if(audioStatus.play)audioStart()
})
$('#trackbackButton').click(function(){
  audioBack()
  if(audioStatus.play)audioStart()
})

audio.addEventListener('ended',(d)=>{
  if(random){
    audioRandom()
  }else if(repeat){
  }else{
    audioSkip()
  }
  audioStart()
})

audio.addEventListener('timeupdate',(d)=>{
  $('#audioCurrentTime').text(makeMinuteText(audio.currentTime))
})

audio.addEventListener('loadedmetadata',(d)=>{
  audioSetup()
})
