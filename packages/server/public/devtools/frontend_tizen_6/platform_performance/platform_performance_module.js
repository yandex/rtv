'use strict';PlatformPerformance.MetricsDescription=class{constructor(name,title,color,format,hasPlayer,drawChart,metricsModel,chart,dataid){Object.assign(this,{name:name,title:title,color:color,format:format,hasPlayer:hasPlayer,drawChart:drawChart,chart:chart,indicator:undefined,_active:undefined,_metricsModel:metricsModel,_dataid:dataid})
this.chart.chartsChanged()}
get data(){return this._metricsModel.getMetrics(this._dataid)}
setActive(active){this._active=active
this.chart.chartsChanged()}
isActive(){if(!this.chart.isActiveWithoutCheckingMetrics()){return false;}
if(this._active!==undefined){return this._active}
if(this._settingsModel===undefined){return false}
if(!this.hasPlayer){return this._settingsModel.isDefaultActiveChart(this.chart.id)}
return this._settingsModel.isDefaultActiveMetrics(this.name)}
setSettingsModel(model){this._settingsModel=model;}}
PlatformPerformance.ChartStatus={UNKNOWN:-1,FORCE_DISABLED:0,DISABLED:1,ENABLED:2,FORCE_ENABLED:4}
PlatformPerformance.ChartInfo=class{constructor(title,metrics,format,showTitle,backendNodeId){Object.assign(this,{title:title,metrics:metrics,format:format,showTitle:showTitle,backendNodeId:backendNodeId,indicator:undefined,_metricsModel:undefined,_chartsModel:undefined,_settingsModel:undefined})
this.index=PlatformPerformance.ChartInfo._idxCount++;this.status=PlatformPerformance.ChartStatus.UNKNOWN
this._split=false
this.descriptions=new Map()
this._pendingInformObservers=false}
setMetricsModel(model){this._metricsModel=model}
setChartsModel(model){this._chartsModel=model;}
setSettingsModel(model){this._settingsModel=model;if(this.status===PlatformPerformance.ChartStatus.UNKNOWN){if(this._settingsModel.isDefaultActiveChart(this.id)){this.status=PlatformPerformance.ChartStatus.ENABLED}else{this.status=PlatformPerformance.ChartStatus.DISABLED}}}
setDisabledByUser(){if(this.status>PlatformPerformance.ChartStatus.DISABLED){this.status=PlatformPerformance.ChartStatus.FORCE_DISABLED
this.chartsChanged()}}
setEnabledByUser(){if(this.status<PlatformPerformance.ChartStatus.ENABLED){this.status=PlatformPerformance.ChartStatus.FORCE_ENABLED
this.chartsChanged()}}
setDisabledByModel(){if(this.status<PlatformPerformance.ChartStatus.FORCE_ENABLED){this.status=PlatformPerformance.ChartStatus.DISABLED
this.chartsChanged()}}
setEnabledByModel(){if(this.status>PlatformPerformance.ChartStatus.FORCE_DISABLED){this.status=PlatformPerformance.ChartStatus.ENABLED
this.chartsChanged()}}
hasActiveMetrics(){let hasActiveMetric=false
for(let desc of this.descriptions.values()){hasActiveMetric|=desc.isActive()}
return hasActiveMetric}
isActive(){if(this.status===PlatformPerformance.ChartStatus.FORCE_ENABLED){return true;}
if(this.status<PlatformPerformance.ChartStatus.ENABLED){return false}
return this.hasActiveMetrics()}
isActiveWithoutCheckingMetrics(){return this.status>=PlatformPerformance.ChartStatus.ENABLED}
countDisplayedMetrics(){var result=0;for(let desc of this.descriptions.values()){if(desc.isActive())result++}
return result}
chartsChanged(){this._chartsModel.chartsChanged();}
get split(){return this._split}
toggleSplit(){this._split=!this._split
if(this._chartsModel){this._chartsModel.chartsChanged()}}
copy(){return new PlatformPerformance.ChartInfo(this.title,this.metrics,this.format,this.showTitle)}
get id(){if(this.backendNodeId){return this.backendNodeId}
return this.title;}}
PlatformPerformance.ChartInfo._idxCount=0
PlatformPerformance.ChartsModel=class{constructor(metricsModel,settingsModel){this._charts=new Map()
this._players=new Map()
this._metrics=new Set()
this._metricsModel=metricsModel
this._metricsModel.addObserver(this)
this._settingsModel=settingsModel
this._observers=[]}
addObserver(observer){this._observers.push(observer)}
getCharts(){let charts=Array.from(this._charts.values())
let inactivePredicate=(chart)=>{return!chart.isActive()&&!chart.receivingData}
let disabledCharts=charts.filter(inactivePredicate).sort((a,b)=>a.index<=b.index)
let enabledCharts=charts.filter((chart)=>!inactivePredicate(chart)).sort((a,b)=>a.index<=b.index)
return[...enabledCharts,...disabledCharts]}
saveDataFile(fileName,fileFormat){var dataString=""
var blob=null
switch(fileFormat){case'JSON':dataString=this.convertArrayToJSON()
blob=new Blob([dataString],{type:'application/json'})
break
case'CSV':dataString=this.convertArrayToCSV()
blob=new Blob([dataString],{type:'text/csv'})
fileName=fileName+'.csv'
break}
var url=URL.createObjectURL(blob)
if(window.navigator.msSaveOrOpenBlob){window.navigator.msSaveOrOpenBlob(blob,fileName)}else{var a=document.createElement("a")
a.href=url
a.download=fileName
document.body.appendChild(a)
a.click()
setTimeout(function(){document.body.removeChild(a)
window.URL.revokeObjectURL(url)},0)}}
convertArrayToCSV(){var samplesByMetricsTitle=new Map()
var charts=this.getCharts()
var maxLength=-Infinity
for(let chart of charts){var descriptions=chart.descriptions.valuesArray()
for(let desc of descriptions){if(!samplesByMetricsTitle.has(desc.title)){if(maxLength<desc.data.samples.length){maxLength=desc.data.samples.length}
let name=desc.title
if(chart.backendNodeId){name+="#"+chart.backendNodeId}
samplesByMetricsTitle.set(name,desc.data.getSamplesRange(-Infinity,Infinity))}}}
var result="Sample receive time,"
var samples=samplesByMetricsTitle.valuesArray()
var metrics=samplesByMetricsTitle.keysArray()
for(let key of metrics){result+=key+','}
result=result.slice(0,result.length-1)
result=result+'\n'
for(let lineNum=0;lineNum<maxLength;lineNum++){var timestamp=Infinity
for(let item of samples){if(item.length>0&&timestamp>item.at(0).recvTimestamp){timestamp=item.at(0).recvTimestamp}}
let line=timestamp+","
for(let i=0;i<samples.length;i++){if(samples[i].length>0&&samples[i].at(0).recvTimestamp===timestamp){line+=samples[i].at(0).value+","
samples[i].beginIdx++}else{line+=","}}
result+=line.slice(0,line.length-1)+"\n"}
return result}
convertArrayToJSON(){var list=new Array()
var charts=this.getCharts()
for(let chart of charts){var chartTitle=chart.backendNodeId?chart.backendNodeId:chart.title
var descriptions=chart.descriptions.valuesArray()
for(let desc of descriptions){var title=desc.title
var samples=desc.data.samples
for(let sample of samples){list.push({name:title,recvTimestamp:sample.recvTimestamp,timestamp:sample.timestamp,value:sample.value,chartName:chartTitle})}}}
var arr=new Array()
for(let item of list){var element={pid:1,tid:1,ts:item.recvTimestamp,ph:'C',cat:item.chartName,name:item.name,args:{}}
element.args[item.name]=item.value
arr.push(element)}
var jsonData={traceEvents:arr}
var jsonString=JSON.stringify(jsonData)
return jsonString}
chartsChanged(){if(this._pendingInformObservers)
return;this._pendingInformObservers=true
setTimeout(()=>this.informObservers(),0)}
onMetrics(metrics){let updatedCharts=new Set();for(let entry of metrics){if(!PlatformPerformance.METRICS_INFO.hasOwnProperty(entry.name)){continue}
let id=PlatformPerformance.PlatformMetricsModel.getMetricsId(entry)
if(this._metrics.has(id))continue
if(entry.backendNodeId!==undefined){this._updatePlayerMetric(entry,updatedCharts)}else{this._updateCommonMetric(entry,updatedCharts)}}
for(let chart of this._charts.values()){if(updatedCharts.has(chart)){chart.receivingData=true;chart.setEnabledByModel()
continue;}
chart.receivingData=false
chart.setDisabledByModel();}}
_createChartForPlayer(player){var node=new SDK.DeferredDOMNode(SDK.targetManager.mainTarget(),player)
var titlePromise=node.resolveToObject('').then((remote_object)=>{if(remote_object===null){return"[null]";}
var repr=ObjectUI.ObjectPropertiesSection.createValueElement(remote_object,false,false)
return repr})
var chart=new PlatformPerformance.ChartInfo(titlePromise,[],undefined,true,player)
chart.setMetricsModel(this._metricsModel)
chart.setChartsModel(this)
chart.setSettingsModel(this._settingsModel)
chart.setEnabledByModel()
return chart}
_updateCommonMetric(entry,updatedCharts){for(let chartInfo of PlatformPerformance.CHARTS_INFO){for(let name of chartInfo.metrics){if(name!==entry.name)continue
let chart=this._charts.get(chartInfo.id)
if(chart===undefined){let newChart=chartInfo.copy()
newChart.showTitle=newChart.showTitle
newChart.setMetricsModel(this._metricsModel)
newChart.setChartsModel(this)
newChart.setSettingsModel(this._settingsModel)
this._charts.set(newChart.id,newChart)
chart=newChart}
updatedCharts.add(chart)
let desc=chart.descriptions.get(entry.name)
if(desc===undefined){let template=PlatformPerformance.METRICS_INFO[entry.name]
desc=new PlatformPerformance.MetricsDescription(entry.name,template.title,template.color,template.format,false,template.drawChart,this._metricsModel,chart,PlatformPerformance.PlatformMetricsModel.getMetricsId(entry))
desc.setSettingsModel(this._settingsModel)
chart.descriptions.set(entry.name,desc)}
break}}}
_updatePlayerMetric(entry,updatedCharts){let chart=this._players.get(entry.backendNodeId)
if(chart===undefined){chart=this._createChartForPlayer(entry.backendNodeId)
this._players.set(entry.backendNodeId,chart)
this._charts.set(chart.id,chart)}
updatedCharts.add(chart)
let descriptor=chart.descriptions.get(entry.name)
if(descriptor===undefined){let template=PlatformPerformance.METRICS_INFO[entry.name]
descriptor=new PlatformPerformance.MetricsDescription(entry.name,template.title,template.color,template.format,true,template.drawChart,this._metricsModel,chart,PlatformPerformance.PlatformMetricsModel.getMetricsId(entry))
descriptor.setSettingsModel(this._settingsModel)
chart.descriptions.set(entry.name,descriptor)
chart.metrics.push(entry.name)}}
informObservers(){let event='onChartsChanged'
this._pendingInformObservers=false
for(let observer of this._observers){if(typeof observer[event]==='function'){observer[event]()}}}};"use strict"
PlatformPerformance.Format={Percent:Symbol('Percent'),Bytes:Symbol('Bytes'),PlayerState:Symbol('PlayerState'),AppSrc:Symbol('AppSrc'),String_:Symbol('String')}
PlatformPerformance._numberFormatter=new Intl.NumberFormat('en-US',{maximumFractionDigits:1})
PlatformPerformance._percentFormatter=new Intl.NumberFormat('en-US',{maximumFractionDigits:1,style:'percent'})
PlatformPerformance.appSrcFormatter={format:(value)=>{switch(value){case 0:return"None";case 1:return"Underrun";case 2:return"Minimum threshold";case 3:return"Normal";case 4:return"Maximum threshold";case 5:return"Overflow";case 6:return"End of stream";default:return"Error";}}}
PlatformPerformance.playerStateFormatter={format:(value)=>{switch(value){case 0:return"None";case 1:return"Idle";case 2:return"Ready";case 3:return"Playing";case 4:return"Paused";default:return"Error";}}}
PlatformPerformance.stringFormatter={format:(value)=>{return value;}}
PlatformPerformance.formatNumber=function(value,format){switch(format){case PlatformPerformance.Format.Percent:return PlatformPerformance._percentFormatter.format(value)
case PlatformPerformance.Format.Bytes:return Common.UIString('%s\xa0MB',PlatformPerformance._numberFormatter.format(value/1e6))
case PlatformPerformance.Format.AppSrc:return PlatformPerformance.appSrcFormatter.format(value)
case PlatformPerformance.Format.PlayerState:return PlatformPerformance.playerStateFormatter.format(value)
case PlatformPerformance.Format.String_:return PlatformPerformance.stringFormatter.format(value)
default:return PlatformPerformance._numberFormatter.format(value)}}
PlatformPerformance.METRICS_INFO={'AAPPSRC':{title:Common.UIString('Audio app source'),color:'red',format:PlatformPerformance.Format.AppSrc,hasPlayer:true},'VAPPSRC':{title:Common.UIString('Video app source'),color:'peru',format:PlatformPerformance.Format.AppSrc,hasPlayer:true},'VSRCBUFFSIZE':{title:Common.UIString('Video SourceBuffer Size'),color:'green',format:PlatformPerformance.Format.Bytes,hasPlayer:true},'ASRCBUFFSIZE':{title:Common.UIString('Audio SourceBuffer Size'),color:'blue',format:PlatformPerformance.Format.Bytes,hasPlayer:true},'VPCKCNT':{title:Common.UIString("Video packet count"),color:'violet',hasPlayer:true},'APCKCNT':{title:Common.UIString("Audio packet count"),color:'cyan',hasPlayer:true},'PLAYERSTATE':{title:Common.UIString("Player state"),color:'magenta',format:PlatformPerformance.Format.PlayerState,hasPlayer:true},'TRUSTZONE':{title:Common.UIString("Trust zone"),color:'indianred',format:PlatformPerformance.Format.Percent,hasPlayer:false},'FRAMEDROP':{title:Common.UIString("Dropped frame count"),color:'orange',hasPlayer:true},'MEDIAKEYS':{title:Common.UIString("Media Keys Count"),color:'crimson',hasPlayer:true},'MEDIAKEYSESSION':{title:Common.UIString("Media Key Sessions Count"),color:'darkgreen',hasPlayer:true},'FRAMERATE':{title:Common.UIString("Video Framerate"),color:'sandybrown',hasPlayer:true},'AUDIOBITRATE':{title:Common.UIString("Audio Bitrate"),color:'skyblue',hasPlayer:true},'VIDEOBITRATE':{title:Common.UIString("Video Bitrate"),color:'chartreuse',hasPlayer:true},'VIDEORESOLUTION':{title:Common.UIString("Video Resolution"),color:'yellowgreen',format:PlatformPerformance.Format.String_,hasPlayer:true,drawChart:false},'AUDIOCODEC':{title:Common.UIString("Audio Codec"),color:'mediumorchid',format:PlatformPerformance.Format.String_,hasPlayer:true,drawChart:false},'VIDEOCODEC':{title:Common.UIString("Video Codec"),color:'lime',format:PlatformPerformance.Format.String_,hasPlayer:true,drawChart:false},'MEDIAKEYSTATUS':{title:Common.UIString("Media Key Statuses"),color:'teal',format:PlatformPerformance.Format.String_,hasPlayer:true,drawChart:false}}
PlatformPerformance.CHARTS_INFO=[new PlatformPerformance.ChartInfo(Common.UIString('TRUSTZONE'),['TRUSTZONE'],PlatformPerformance.Format.Percent)];'use strict'
PlatformPerformance.ChartIndicator=class{constructor(chart,chartsModel){this._parent=undefined
this._chart=chart
this._chart.indicator=this
chartsModel.addObserver(this)
this.element=document.createElement('div')
this.element.classList.add('perfmon-chart-indicator')
this.setTitle(this._chart.title)
this._indicators=new Map()
this.element.classList.toggle('active',this.isActive())}
attach(parent){if(this._parent===parent){return;}
if(this._parent!==undefined){this._parent.removeChild(this.element)}
this._parent=parent;this._parent.appendChild(this.element)}
detach(){if(this._parent===undefined){return}
this._parent.removeChild(this.element);this._parent=undefined}
onChartsChanged(){this.element.classList.toggle('active',this.isActive())}
isActive(){return this._chart.isActive()}
setTitle(title){if(!this._chart.showTitle)return
if(this.titleElement===undefined){this.titleElement=this.element.createChild('div','perfmon-chart-indicator-title')}else{this.titleElement.innerHTML=''}
this.titleElement.addEventListener('mouseover',(event)=>{event.stopPropagation()
if(this.isActive())
this._chart.highlight=true
this.element.classList.toggle('highlight',true)})
this.titleElement.addEventListener('mouseout',(event)=>{event.stopPropagation()
this._chart.highlight=false
this.element.classList.toggle('highlight',false)})
let valueContainer=this.titleElement.createChild('span')
valueContainer.addEventListener('click',(ev)=>{if(!this.isActive()){ev.stopPropagation()}},true)
if(title instanceof Promise){title.then((titleVal)=>{this.setTitle(titleVal)})
title='...'}
if(title instanceof HTMLElement){valueContainer.appendChild(title)}else{valueContainer.innerText=title}
let buttonContainer=this.titleElement.createChild('span')
let ungroupButton=buttonContainer.createChild('button')
ungroupButton.innerText='O'
ungroupButton.onclick=(event)=>{event.stopPropagation()
this._chart.toggleSplit()}
let disableButton=buttonContainer.createChild('button')
disableButton.innerText='X'
disableButton.onclick=(event)=>{event.stopPropagation()
this.toggle()}}
update(){for(let metricsId of this._chart.metrics){let indicator=this._indicators.get(metricsId)
if(indicator===undefined){indicator=new PlatformPerformance.MetricIndicator(this,this._chart.descriptions.get(metricsId))
this._indicators.set(metricsId,indicator)}
indicator.update()}}
setActive(active){if(active){this._chart.setEnabledByUser()}else{this._chart.setDisabledByUser()}
this.element.classList.toggle('active',active)}
toggle(){this.setActive(!this._chart.isActive())}}
PlatformPerformance.MetricIndicator=class{constructor(parent,description){Object.assign(this,{parent:parent,description:description})
this.description.indicator=this
this._parentElement=parent.element
var color=description.color
this.element=this._parentElement.createChild('div','perfmon-indicator')
this.element.addEventListener('mouseover',(event)=>{event.stopPropagation()
if(this.description.isActive())
this.description.highlight=true
this.element.classList.toggle('highlight',true)})
this.element.addEventListener('mouseout',(event)=>{event.stopPropagation()
this.description.highlight=false
this.element.classList.toggle('highlight',false)})
this._swatchElement=this.element.createChild('div','perfmon-indicator-swatch')
this._swatchElement.style.borderColor=color
this.element.createChild('div','perfmon-indicator-title').textContent=description.title
this._valueElement=this.element.createChild('div','perfmon-indicator-value')
this._valueElement.style.color=color
this._disabled=false
this.element.classList.toggle('active',this.description.isActive())
this.element.onclick=this.toggle.bind(this)}
update(){var data=this.description.data
var value=data.at(data.length-1).value
this.setValue(value,this.description.format)}
updateRepresentation(){if(!this.remote_object)return
var repr=ObjectUI.ObjectPropertiesSection.createValueElement(this.remote_object,false,false,this.element)
var titleElement=this.element.children[1]
var container=document.createElement('div')
container.classList.add('perfmon-indicator-title-target')
container.appendChild(repr)
titleElement.after(container)}
setValue(value,format){this._valueElement.textContent=PlatformPerformance.formatNumber(value,format)}
setActive(active){this.description.setActive(active)
this.element.classList.toggle('active',active)}
toggle(){this.setActive(!this.description.isActive())}}
PlatformPerformance.ControlPane=class{constructor(parent,metricsModel,chartsModel,settingsModel){Object.assign(this,{parent:parent,_metricsModel:metricsModel,_chartsModel:chartsModel,_settingsModel:settingsModel})
this._metricsModel.addObserver(this)
this._chartsModel.addObserver(this)
this.element=parent.createChild('div','perfmon-control-pane')
this._toolbar=new UI.Toolbar('',this.element)
this._toggleRecordingAction=UI.actionRegistry.action('platformPerformance.toggle-recording')
UI.Toolbar.createActionButton(this._toggleRecordingAction)
this._enableButton=UI.Toolbar.createActionButton(this._toggleRecordingAction)
this._toolbar.appendToolbarItem(this._enableButton)
this._saveJSONAction=UI.actionRegistry.action('platformPerformance.save-jsonFile')
this._saveButton=UI.Toolbar.createActionButton(this._saveJSONAction)
this._toolbar.appendToolbarItem(this._saveButton)
this._toolbar.appendSeparator()
this._samplingIntervalBox=new UI.ToolbarComboBox(this.onSamplingIntervalChanged.bind(this))
this._toolbar.appendToolbarItem(this._samplingIntervalBox)
let pollInterval=this._metricsModel.getPollInterval()
for(let t of[500,1000,1500,2000]){let option=this._samplingIntervalBox.createOption(t+' ms','',t)
if(t===pollInterval){this._samplingIntervalBox.select(option)}}
this._showSettingsPaneSetting=Common.settings.createSetting('platformPerformanceSettings',false)
this._showSettingsPaneButton=new UI.ToolbarSettingToggle(this._showSettingsPaneSetting,'largeicon-settings-gear',Common.UIString('Settings'))
this._toolbar.appendToolbarItem(this._showSettingsPaneButton)
this._createSettingsView()
this._showSettingsPaneSetting.addChangeListener(this._updateSettingsViewVisibility.bind(this))
this._updateSettingsViewVisibility()
this._indicators=new Map()}
onChartCheckboxChange(chartName,event){this._settingsModel.setDefaultActiveChart(chartName,event.target.checked)}
onMetricCheckboxChange(metricName,event){this._settingsModel.setDefaultActiveMetrics(metricName,event.target.checked)}
onSamplingIntervalChanged(event){this._settingsModel.setPollInterval(event.target.value)}
_updateSettingsViewVisibility(){if(this._showSettingsPaneSetting.get()){this._settingsPane.showWidget()}else{this._settingsPane.hideWidget()}}
_createSettingsView(){this._settingsPane=new UI.HBox()
this._settingsPane.element.classList.add('platform-performance-settings-pane')
this._settingsPane.show(this.element)
var captureToolbar=new UI.Toolbar('',this._settingsPane.element)
captureToolbar.makeVertical()
captureToolbar.appendText('Default charts')
for(let chart of PlatformPerformance.CHARTS_INFO){let checkbox=new UI.ToolbarCheckbox(chart.title,'',this.onChartCheckboxChange.bind(this,chart.title))
checkbox.setChecked(this._settingsModel.isDefaultActiveChart(chart.id))
captureToolbar.appendToolbarItem(checkbox)}
captureToolbar.appendText('Default player metrics')
for(let name of Object.keys(PlatformPerformance.METRICS_INFO)){let metrics=PlatformPerformance.METRICS_INFO[name]
if(!metrics.hasPlayer)continue
let checkbox=new UI.ToolbarCheckbox(metrics.title,'',this.onMetricCheckboxChange.bind(this,name))
checkbox.setChecked(this._settingsModel.isDefaultActiveMetrics(name))
captureToolbar.appendToolbarItem(checkbox)}}
onChartsChanged(){for(let indicator of this._indicators.values()){indicator.detach();}
let charts=this._chartsModel.getCharts()
for(let chart of charts){var indicator=this._indicators.get(chart.id)
if(indicator===undefined){indicator=new PlatformPerformance.ChartIndicator(chart,this._chartsModel)
this._indicators.set(chart.id,indicator)}
indicator.attach(this.element)}}
onMetrics(){for(let indicator of this._indicators.values()){indicator.update()}}
onEnabled(){this._enableButton.setToggled(true)}
onDisabled(){this._enableButton.setToggled(false)}};"use strict"
PlatformPerformance.Sample=class extends Array{get recvTimestamp(){return this[0]}
set recvTimestamp(val){this[0]=val}
get timestamp(){return this[1]}
set timestamp(val){this[1]=val}
get value(){return this[2]}
set value(val){this[2]=val}}
PlatformPerformance.SampleArrayView=class{constructor(array,beginIdx,endIdx){this._array=array
this.beginIdx=beginIdx
this.endIdx=endIdx}
at(idx){return this._array[this.beginIdx+idx]}
get length(){return this.endIdx-this.beginIdx}}
PlatformPerformance.SampleArray=class{constructor(){this.max=0
this._samples=[]}
at(idx){return this._samples[idx]}
get length(){return this._samples.length}
addSample(recvTimestmp,timestamp,value){var key=function(data){return data.recvTimestamp}
if(value>this.max){this.max=value}
return PlatformPerformance.sortedInsert(this._samples,new PlatformPerformance.Sample(recvTimestmp,timestamp,value),key)}
find(timestamp){var key=function(data){return data.recvTimestamp}
return PlatformPerformance.binarySearch(this._samples,timestamp,key)}
findLeft(timestamp){var key=function(data){return data.recvTimestamp}
return PlatformPerformance.binarySearchLeftmost(this._samples,timestamp,key)}
findRight(timestamp){var key=function(data){return data.recvTimestamp}
return PlatformPerformance.binarySearchRightmost(this._samples,timestamp,key)}
getSample(timestamp){var idx=this.find(timestamp)
if(idx==this.length)return null
return this._samples[idx]}
getSampleLeft(timestamp){var idx=this.findLeft(timestamp)
if(idx==this.length)return null
return this._samples[idx]}
getSampleRight(timestamp){var idx=this.findRight(timestamp)
if(idx==this.length)return null
return this._samples[idx]}
getSamplesRange(from,to){var begin=this.findRight(from)
if(begin===this.length){return new PlatformPerformance.SampleArrayView(this._samples,this.length,this.length)}
var end=this.findLeft(to)
if(end===this.length){return new PlatformPerformance.SampleArrayView(this._samples,this.length,this.length)}
return new PlatformPerformance.SampleArrayView(this._samples,begin,end+1)}
setDataForTests(data){this._samples=data}
get samples(){return this._samples}};'use strict'
PlatformPerformance.Panel=class extends UI.Panel{constructor(){super('platform-performance')
this.registerRequiredCSS('platform_performance/performanceMonitor.css')
this._metricsModel=SDK.targetManager.mainTarget().model(SDK.PerformanceMetricsModel)
this._settingsModel=new PlatformPerformance.SettingsModel()
this._platformMetricsModel=new PlatformPerformance.PlatformMetricsModel(this._metricsModel)
this._chartsModel=new PlatformPerformance.ChartsModel(this._platformMetricsModel,this._settingsModel);this._hbox=new UI.HBox()
this._controlPane=new PlatformPerformance.ControlPane(this._hbox.element,this._platformMetricsModel,this._chartsModel,this._settingsModel)
this._plotPane=new PlatformPerformance.PlotPane(this._platformMetricsModel,this._chartsModel)
this._plotPane.show(this._hbox.element)
this.popup=new PlatformPerformance.PopUp(this.element,this._chartsModel)}
wasShown(){UI.context.setFlavor(PlatformPerformance.Panel,this)
this._hbox.show(this.element)
this._hbox.onResize()}
toggleRecording(){if(this._platformMetricsModel.isEnabled()){this._platformMetricsModel.disable()}else{this._platformMetricsModel.enable()}}
saveJSONFile(){this.popup.makepopup()}}
PlatformPerformance.PopUp=class{constructor(parent,model){this.parent=parent
this.model=model
this.popupDisplayed=false;}
saveAsFileName(){var fileName=this.inputElem.value
if(fileName==''){alert("insert name")}else{var saveFormat=this.select.value
this.model.saveDataFile(fileName,saveFormat)
this.removePopup()}}
makepopup(){if(this.popupDisplayed==false){this.element=this.parent.createChild('div','perfmon-back-container')
this.popup=this.element.createChild('div','perfmon-save-container')
this.titleContainer=this.popup.createChild('div','perfmon-name-container')
this.title=this.titleContainer.createChild('span','perfmon-name-pane')
this.title.innerText='File name: '
this.inputElem=this.titleContainer.createChild('input','perfmon-name-input')
this.formatContainer=this.popup.createChild('div','perfmon-format-container')
this.selectText=this.formatContainer.createChild('span','perfmon-format-pane')
this.selectText.innerText='File format: '
this.select=this.formatContainer.createChild('select','perfmon-format-select')
this.op1=this.select.createChild('option','option')
this.op2=this.select.createChild('option','option')
this.op1.innerText="JSON"
this.op2.innerText="CSV"
this.buttonContainer=this.popup.createChild('div','perfmon-button-container')
var saveBtn=this.buttonContainer.createChild('button','perfmon-submit-button')
var cancelBtn=this.buttonContainer.createChild('button','perfmon-cancel-button')
saveBtn.innerText='OK'
cancelBtn.innerText='CANCEL'
saveBtn.addEventListener('click',this.saveAsFileName.bind(this))
cancelBtn.addEventListener('click',this.removePopup.bind(this))
this.popupDisplayed=true}}
removePopup(){if(this.popupDisplayed==true){this.parent.removeChild(this.element)
this.popupDisplayed=false}}}
PlatformPerformance.Panel.ActionDelegate=class{handleAction(context,actionId){var panel=UI.context.flavor(PlatformPerformance.Panel)
console.assert(panel&&panel instanceof PlatformPerformance.Panel)
switch(actionId){case'platformPerformance.toggle-recording':panel.toggleRecording()
return true
case'platformPerformance.save-jsonFile':panel.saveJSONFile()
return true}
return false}};'use strict';PlatformPerformance.PlatformMetricsModel=class{constructor(model){this._metricsModel=model
this._metrics=new Map()
this._pollHandle=null
this._pollIntervalInMs=500
this._maxTimestamp=-Infinity
this._timestamps=[]
this._firstSampleRecvTime=undefined
this._observers=[]}
static getMetricsId(metric){if(metric.backendNodeId){return metric.name+'$'+metric.backendNodeId}
return metric.name}
isEnabled(){return this._pollHandle!==null}
enable(){this._pollHandle=setInterval(()=>{this._poll()},this._pollIntervalInMs)
this._metricsModel.enable();this.informObservers('onEnabled')}
disable(){if(this._pollHandle!==null){clearInterval(this._pollHandle)
this._pollHandle=null}
this._metricsModel.disable();this.informObservers('onDisabled')}
addObserver(observer){this._observers.push(observer)}
hasData(){return this._timestamps.length>0;}
informObservers(event,args){for(let observer of this._observers){if(typeof observer[event]==='function'){setTimeout(()=>{observer[event](args)},0)}}}
getPollInterval(){return this._pollIntervalInMs}
setPollInterval(value){this._pollIntervalInMs=value
if(this._pollHandle!==null){clearInterval(this._pollHandle)
this._pollHandle=setInterval(()=>{this._poll()},this._pollIntervalInMs)}}
_processMetrics(metrics){var recvTimestamp=performance.now();var timestamp;for(let m of metrics){if(m.name==='Timestamp'){timestamp=m.value
break}}
PlatformPerformance.sortedInsert(this._timestamps,recvTimestamp,(x)=>x)
for(let m of metrics){if(m.name==='Timestamp'){continue}
let id=PlatformPerformance.PlatformMetricsModel.getMetricsId(m)
let info=this._metrics.get(id)
if(info===undefined){info=new PlatformPerformance.SampleArray()
this._metrics.set(id,info)}
if(m.value>info.max){info.max=m.value}
info.addSample(recvTimestamp,timestamp,m.value)}}
async _poll(){var platfromMetrics=await this._metricsModel.requestPlatformMetrics()
var standardMetrics=await this._metricsModel.requestMetrics();var metrics=[...platfromMetrics,...standardMetrics.metrics]
if(this._firstSampleRecvTime===undefined){this._firstSampleRecvTime=Date.now()}
this._processMetrics(metrics)
this.informObservers('onMetrics',metrics)}
getMetrics(id){return this._metrics.get(id)}};'use strict';PlatformPerformance.ViewController=class{constructor(chartsPane,container){this._chartsPane=chartsPane
container.addEventListener('mousedown',this.onMouseDown.bind(this))
container.addEventListener('mousemove',this.onMouseMove.bind(this))
container.addEventListener('mouseup',this.onMouseUp.bind(this))
this._isMousePressed=false
this._startPos=0
this._startTime=0
this._endTime=0
this._moveThreshold=10
this._followThreshold=200}
onMouseDown(ev){this._isMousePressed=true
this._startPos=ev.clientX
this._startTime=this._chartsPane.getDisplayedTime()}
onMouseUp(ev){this._isMousePressed=false
if(Math.abs(this._endTime-this._chartsPane.getFollowTime())<this._followThreshold){this._chartsPane.setDisplayedTime(null)}}
onMouseMove(ev){if(!this._isMousePressed){return}
var delta=ev.clientX-this._startPos
if(Math.abs(delta)<=this._moveThreshold){return}
var tDelta=-delta/this._chartsPane._pixelsPerMs
var newTime=this._startTime+tDelta
if(newTime>this._chartsPane.getFollowTime()){newTime=this._chartsPane.getFollowTime()}
this._chartsPane.setDisplayedTime(newTime)
this._endTime=newTime}}
PlatformPerformance.MetricsDisplayInfo=class{constructor(desc){this.descriptor=desc
this.reset()}
reset(){this.minSampleTimestamp=Infinity
this.maxSampleTimestamp=-Infinity
this.minTimestamp=Infinity
this.maxTimestamp=-Infinity
this.height=0
this.pos=0
this.maxVal=0
this._shouldRepaint=false}
updateMaxVal(){let val=this.descriptor.data.max
if(this.maxVal!==val){this._shouldRepaint=true}
this.maxVal=val}
resetShouldRepaint(){this._shouldRepaint=false}
shouldRepaint(){return this._shouldRepaint}
resetTimestamps(){this.minSampleTimestamp=Infinity
this.maxSampleTimestamp=-Infinity
this.minTimestamp=Infinity
this.maxTimestamp=-Infinity}}
PlatformPerformance.ChartDisplayInfo=class{constructor(chart,height){this.chart=chart
this.children=new Map()
this.reset()
this._height=height}
updateDescriptions(){for(let desc of this.chart.descriptions.values()){if(!this.children.has(desc.name)){this.addDesc(desc)}}
this.height=this._height}
get height(){return this._height}
set height(value){this._height=value
for(let child of this.children.values()){child.height=value}}
get totalHeight(){let result=0
if(!this.chart.split){return this._height}
for(let desc of this.chart.descriptions.values()){if(!desc.isActive())continue
result+=this.getDesc(desc.name).height}
return result}
addDesc(desc){this.children.set(desc.name,new PlatformPerformance.MetricsDisplayInfo(desc));}
getDesc(id){return this.children.get(id)}
_getProp(name,join){var result
var op
switch(join){case'min':{result=Infinity
op=(v)=>result=Math.min(result,v)
break}
case'max':{result=-Infinity
op=(v)=>result=Math.max(result,v)
break}
case'sum':{result=0
op=(v)=>result+=v
break}}
for(let child of this.children.values()){op(child[name])}
return result}
_setProp(name,val){for(let child of this.children.values()){child[name]=val}}
updateMaxVal(){for(let child of this.children.values()){child.updateMaxVal()}}
shouldRepaint(){for(let child of this.children.values()){if(child.shouldRepaint())return true}
return false}
resetShouldRepaint(){for(let child of this.children.values()){child.resetShouldRepaint()}}
get maxVal(){return this._getProp('maxVal','max')}
get minSampleTimestamp(){return this._getProp('minSampleTimestamp','min')}
get maxSampleTimestamp(){return this._getProp('maxSampleTimestamp','max')}
get minTimestamp(){return this._getProp('minTimestamp','min')}
get maxTimestamp(){return this._getProp('maxTimestamp','max')}
set minTimestamp(val){return this._setProp('minTimestamp',val)}
set maxTimestamp(val){return this._setProp('maxTimestamp',val)}
reset(){for(let child of this.children.values()){child.reset()}}
resetTimestamps(){for(let child of this.children.values()){child.resetTimestamps()}}}
PlatformPerformance.PlotPane=class extends UI.HBox{constructor(metricsModel,chartsModel){super(true)
this._height=0
this._width=0
this._metricsModel=metricsModel
this._chartsModel=chartsModel
this._chartsModel.addObserver(this)
this.registerRequiredCSS('platform_performance/performanceMonitor.css')
this.contentElement.classList.add('perfmon-pane')
this._topOffset=16
this._pixelsPerMs=20/1000
this._gridColor=UI.themeSupport.patchColorText('rgba(0, 0, 0, 0.08)',UI.ThemeSupport.ColorUsage.Foreground)
this._canvasContainer=this.contentElement.createChild('div')
this._canvasContainer.classList.add('perfmon-canvas-container')
this._canvas=this._canvasContainer.createChild('canvas')
this._offscreenCanvas=(this._canvasContainer.createChild('canvas'))
this._offscreenCanvas.style='display: none'
this._backgroundCanvas=(this._canvasContainer.createChild('canvas'))
this._backgroundCanvas.addEventListener('mouseout',(event)=>{for(var chart of this._chartsModel.getCharts()){let chartDisplay=this._chartsDisplayMap.get(chart.id)
if(chartDisplay===undefined)continue
chart.indicator.element.classList.toggle('highlight',false)
chart.highlight=false
for(let key of chart.descriptions.keys()){let desc=chart.descriptions.get(key)
desc.highlight=false
desc.indicator.element.classList.toggle('highlight',false)}}})
this._backgroundCanvas.addEventListener('mousemove',(event)=>{for(var chart of this._chartsModel.getCharts()){let chartDisplay=this._chartsDisplayMap.get(chart.id)
if(chartDisplay===undefined)continue
let chartHighlight=!chart.split&&event.offsetY>=chartDisplay.pos&&event.offsetY<chartDisplay.pos+chartDisplay.height&&chart.isActive()
chart.indicator.element.classList.toggle('highlight',chartHighlight)
chart.highlight=chartHighlight
for(let key of chart.descriptions.keys()){let desc=chart.descriptions.get(key)
let metricsDisplay=chartDisplay.getDesc(key)
let metricsHighlight=event.offsetY>=metricsDisplay.pos&&event.offsetY<metricsDisplay.pos+metricsDisplay.height&&desc.isActive()&&desc.drawChart!==false
desc.highlight=metricsHighlight
desc.indicator.element.classList.toggle('highlight',metricsHighlight)}}})
this._chartsDisplayMap=new Map()
this._currentTransform=0
this._requestedTimestamp=null
this._rightAnchor=0
this._chartHeight=90
this._firstDrawTime=-Infinity;this._followTime=-Infinity;this._controller=new PlatformPerformance.ViewController(this,this.contentElement)}
onChartsChanged(){this.invalidatePainting()}
setDisplayedTime(time){this._requestedTimestamp=time}
getDisplayedTime(){return this._rightAnchor}
getFollowTime(){return this._followTime}
onResize(){super.onResize()
this._width=this._canvasContainer.offsetWidth
this._canvas.width=Math.round(this._width*window.devicePixelRatio)
this._offscreenCanvas.width=this._canvas.width
this._backgroundCanvas.width=this._canvas.width
this.invalidatePainting()
this._draw()}
setHeight(height){this._canvasContainer.style.height=height+"px"
this._height=this._canvasContainer.offsetHeight
this._canvas.height=Math.round(this._height*window.devicePixelRatio)
this._offscreenCanvas.height=this._canvas.height
this._backgroundCanvas.height=this._canvas.height}
wasShown(){this.onResize()
animate.call(this)
function animate(){this._draw()
this._animationId=this.contentElement.window().requestAnimationFrame(animate.bind(this))}}
willHide(){this.contentElement.window().cancelAnimationFrame(this._animationId)}
invalidatePainting(){for(let chartDisplay of this._chartsDisplayMap.values()){chartDisplay.resetTimestamps()}
var ctx=this._canvas.getContext('2d')
ctx.clearRect(0,0,this._width,this._height)}
_timestampToPos(timestamp){let timeDelta=this._rightAnchor-timestamp
return this._width-Math.floor(timeDelta*this._pixelsPerMs)-1}
_drawVerticalGrid(ctx,height,max,format){var base=Math.pow(10,Math.floor(Math.log10(max)))
var firstDigit=Math.floor(max/base)
if(firstDigit!==1&&firstDigit%2===1){base*=2}
var scaleValue=Math.floor(max/base)*base
var span=max
var topPadding=5
var visibleHeight=height-topPadding
ctx.fillStyle=UI.themeSupport.patchColorText('rgba(0, 0, 0, 0.3)',UI.ThemeSupport.ColorUsage.Foreground)
ctx.strokeStyle=this._gridColor
ctx.beginPath()
for(var i=0;i<2;++i){var y=calcY(scaleValue)
var labelText=PlatformPerformance.formatNumber(scaleValue,format)
ctx.moveTo(0,y)
ctx.lineTo(4,y)
ctx.moveTo(ctx.measureText(labelText).width+12,y)
ctx.lineTo(this._width,y)
ctx.fillText(labelText,8,calcY(scaleValue)+3)
scaleValue/=2}
ctx.stroke()
ctx.beginPath()
ctx.moveTo(0,height+0.5)
ctx.lineTo(this._width,height+0.5)
ctx.strokeStyle=UI.themeSupport.patchColorText('rgba(0, 0, 0, 0.2)',UI.ThemeSupport.ColorUsage.Foreground)
ctx.stroke()
function calcY(value){return Math.round(height-visibleHeight*value/span)+0.5}}
_drawHorizontalGrid(ctx,currentTime){var lightGray=UI.themeSupport.patchColorText('rgba(0, 0, 0, 0.02)',UI.ThemeSupport.ColorUsage.Foreground)
ctx.font='9px '+Host.fontFamily()
ctx.fillStyle=UI.themeSupport.patchColorText('rgba(0, 0, 0, 0.3)',UI.ThemeSupport.ColorUsage.Foreground)
currentTime=currentTime/1000
for(var sec=Math.ceil(currentTime);;--sec){var x=this._width-((currentTime-sec)*1000)*this._pixelsPerMs
if(x<-50){break}
ctx.beginPath()
ctx.moveTo(Math.round(x)+0.5,0)
ctx.lineTo(Math.round(x)+0.5,this._height)
if(sec>=0&&sec%5===0){ctx.fillText(new Date(sec*1000).toLocaleTimeString(),Math.round(x)+4,12)}
ctx.strokeStyle=sec%5?lightGray:this._gridColor
ctx.stroke()}}
_drawSamples(samples,color,max,ctx){var y
var x
var prevY
var height=this._chartHeight
var topPadding=5
var visibleHeight=height-topPadding
var calcY=function(value){return Math.round(height-visibleHeight*value/max)+0.5}
var X0=this._timestampToPos(samples.at(0).recvTimestamp)
prevY=calcY(samples.at(0).value)
ctx.save()
var top=new Path2D()
var combined=new Path2D()
combined.moveTo(X0,calcY(0))
combined.lineTo(X0,prevY)
top.moveTo(X0,prevY)
for(let i=1;i<samples.length;++i){y=calcY(samples.at(i).value)
x=this._timestampToPos(samples.at(i).recvTimestamp)
top.lineTo(x,prevY)
top.lineTo(x,y)
combined.lineTo(x,prevY)
combined.lineTo(x,y)
prevY=y}
ctx.lineWidth=1
ctx.strokeStyle=color
ctx.stroke(top)
combined.lineTo(x,calcY(0))
ctx.globalAlpha=0.05
ctx.fillStyle=color
ctx.fill(combined)
ctx.restore()
return[samples.at(0).recvTimestamp,samples.at(samples.length-1).recvTimestamp]}
_drawData(from,to,data,metricsDisplay,max,color,ctx){var samplesRight=data.getSamplesRange(metricsDisplay.maxSampleTimestamp,to)
if(samplesRight.length>1){let[updateMin,updateMax]=this._drawSamples(samplesRight,color,max,ctx)
metricsDisplay.minSampleTimestamp=Math.min(updateMin,metricsDisplay.minSampleTimestamp)
metricsDisplay.maxSampleTimestamp=Math.max(updateMax,metricsDisplay.maxSampleTimestamp)}
var samplesLeft=data.getSamplesRange(from,metricsDisplay.minSampleTimestamp)
if(samplesLeft.length>1){let[updateMin,updateMax]=this._drawSamples(samplesLeft,color,max,ctx)
metricsDisplay.minSampleTimestamp=Math.min(updateMin,metricsDisplay.minSampleTimestamp)
metricsDisplay.maxSampleTimestamp=Math.max(updateMax,metricsDisplay.maxSampleTimestamp)}}
_drawChart(from,to,chart,chartDisplay,ctx,backCtx){this._drawVerticalGrid(backCtx,chartDisplay.height,chartDisplay.maxVal,chart.format)
if(chartDisplay.shouldRepaint()){chartDisplay.resetTimestamps()
chartDisplay.resetShouldRepaint()
ctx.clearRect(0,0,this._width,chartDisplay.height)}
chartDisplay.pos=this._currentTransform
for(var descriptor of chart.descriptions.values()){if(!descriptor.isActive()||descriptor.drawChart===false)continue
let metricsDisplay=chartDisplay.getDesc(descriptor.name)
var max=chartDisplay.maxVal
var data=descriptor.data
var color=descriptor.color
metricsDisplay.pos=this._currentTransform
this._drawData(from,to,data,metricsDisplay,max,color,ctx)}
this._currentTransform+=chartDisplay.height
ctx.translate(0,chartDisplay.height)
backCtx.translate(0,chartDisplay.height)
chartDisplay.maxTimestamp=to
chartDisplay.minTimestamp=from}
_drawChartSplitted(from,to,chart,chartDisplay,ctx,backCtx){chartDisplay.pos=this._currentTransform
for(var descriptor of chart.descriptions.values()){if(!descriptor.isActive()||descriptor.drawChart===false)continue
let metricsDisplay=chartDisplay.getDesc(descriptor.name)
var max=metricsDisplay.maxVal
this._drawVerticalGrid(backCtx,metricsDisplay.height,metricsDisplay.maxVal,descriptor.format)
if(metricsDisplay.shouldRepaint()){metricsDisplay.resetTimestamps()
metricsDisplay.resetShouldRepaint()
ctx.clearRect(0,0,this._width,metricsDisplay.height)}
var data=descriptor.data
var color=descriptor.color
this._drawData(from,to,data,metricsDisplay,max,color,ctx)
metricsDisplay.pos=this._currentTransform
this._currentTransform+=metricsDisplay.height
ctx.translate(0,metricsDisplay.height)
backCtx.translate(0,metricsDisplay.height)}
chartDisplay.maxTimestamp=to
chartDisplay.minTimestamp=from}
_drawCharts(from,to,ctx,backCtx){ctx.save()
ctx.translate(0,this._topOffset)
backCtx.save()
backCtx.translate(0,this._topOffset)
this._currentTransform=this._topOffset
var graphHeight=90
for(var chart of this._chartsModel.getCharts()){if(!chart.isActive())continue
var chartDisplay=this._chartsDisplayMap.get(chart.id)
if(chartDisplay===undefined){chartDisplay=new PlatformPerformance.ChartDisplayInfo(chart,graphHeight)
this._chartsDisplayMap.set(chart.id,chartDisplay)}
chartDisplay.updateDescriptions()
chartDisplay.updateMaxVal()
if(chart.split){this._drawChartSplitted(from,to,chart,chartDisplay,ctx,backCtx)}else{this._drawChart(from,to,chart,chartDisplay,ctx,backCtx)}}
ctx.restore()
backCtx.restore()}
_drawHighlight(backCtx){for(var chart of this._chartsModel.getCharts()){let chartDisplay=this._chartsDisplayMap.get(chart.id)
if(chartDisplay===undefined)continue
if(chart.highlight){var height
if(chart.split){height=chartDisplay.height*chart.countDisplayedMetrics()}else{height=chartDisplay.height}
backCtx.save()
backCtx.rect(0,chartDisplay.pos,this._width,height)
backCtx.globalAlpha=0.1
backCtx.fillStyle='blue'
backCtx.fill()
backCtx.restore()
continue}
for(let key of chart.descriptions.keys()){let desc=chart.descriptions.get(key)
if(desc.highlight&&desc.drawChart!==false){let metricsDisplay=chartDisplay.getDesc(key)
backCtx.save()
backCtx.rect(0,metricsDisplay.pos,this._width,metricsDisplay.height)
backCtx.globalAlpha=0.1
backCtx.fillStyle='blue'
backCtx.fill()
backCtx.restore()}}}}
_draw(){if(!this._metricsModel.hasData()){return;}
if(this._firstDrawTime===-Infinity){this._firstDrawTime=performance.now();return;}
let drawTime=performance.now();let redrawDelta=drawTime-this._lastDrawTime
if(redrawDelta*this._pixelsPerMs<1)return;var requestedMaxTimestamp
if(this._requestedTimestamp!==null){requestedMaxTimestamp=this._requestedTimestamp}else{requestedMaxTimestamp=performance.now()}
this._followTime=performance.now()
var maxDrawnTimestamp=-Infinity
for(let info of this._chartsDisplayMap.values()){if(info.maxTimestamp>maxDrawnTimestamp){maxDrawnTimestamp=info.maxTimestamp}}
var tdelta=requestedMaxTimestamp-maxDrawnTimestamp
var precDelta=tdelta*this._pixelsPerMs
if(Math.abs(precDelta)<1)return
var xdelta=Math.floor(precDelta)
var timeInnacuracy=((xdelta-precDelta)/this._pixelsPerMs)
if(isNaN(timeInnacuracy))timeInnacuracy=0
requestedMaxTimestamp+=timeInnacuracy
this._rightAnchor=requestedMaxTimestamp
var requestedMinTimestamp=requestedMaxTimestamp-this._width/this._pixelsPerMs
var offCtx=this._offscreenCanvas.getContext('2d')
offCtx.clearRect(0,0,this._width,this._height)
if(this._width>Math.abs(xdelta)){offCtx.drawImage(this._canvas,-xdelta,0)}
let totalHeight=this._topOffset;for(let chartDisplay of this._chartsDisplayMap.values()){totalHeight+=chartDisplay.totalHeight
if(requestedMinTimestamp>chartDisplay.minTimestamp){chartDisplay.minTimestamp=requestedMinTimestamp}
if(requestedMaxTimestamp<chartDisplay.maxTimestamp){chartDisplay.maxTimestamp=requestedMaxTimestamp}
for(let metricsSizeInfo of chartDisplay.children.values()){if(requestedMinTimestamp>metricsSizeInfo.minSampleTimestamp){let minMetrics=metricsSizeInfo.descriptor.data.getSampleRight(requestedMinTimestamp)
if(minMetrics!==null){let metricsMinTime=minMetrics[0]
metricsSizeInfo.minSampleTimestamp=metricsMinTime}}
if(requestedMaxTimestamp<metricsSizeInfo.maxSampleTimestamp){let maxMetrics=metricsSizeInfo.descriptor.data.getSampleLeft(requestedMaxTimestamp)
if(maxMetrics!==null){let metricMaxTime=maxMetrics[0]
metricsSizeInfo.maxSampleTimestamp=metricMaxTime}}}}
if(totalHeight!==this._height){this.setHeight(totalHeight)}
var backCtx=this._backgroundCanvas.getContext('2d')
backCtx.clearRect(0,0,this._width,this._height)
this._drawHorizontalGrid(backCtx,requestedMaxTimestamp)
this._drawHighlight(backCtx)
this._drawCharts(requestedMinTimestamp,requestedMaxTimestamp,offCtx,backCtx)
var ctx=this._canvas.getContext('2d')
ctx.clearRect(0,0,this._width,this._height)
ctx.drawImage(this._offscreenCanvas,0,0)}};'use strict';PlatformPerformance.SettingsModel=class{constructor(){this._deactivatedChartsSetting=Common.settings.createSetting('platformPerformancedeactivatedCharts',[])
this._deactivatedMetricsSetting=Common.settings.createSetting('platformPerformancedeactivatedMetric',[])
this._deactivatedCharts=new Set(this._deactivatedChartsSetting.get())
this._deactivatedMetrics=new Set(this._deactivatedMetricsSetting.get())}
isDefaultActiveChart(id){return!this._deactivatedCharts.has(id)}
isDefaultActiveMetrics(id){return!this._deactivatedMetrics.has(id)}
setDefaultActiveChart(id,active){if(active){this._deactivatedCharts.delete(id)}else{this._deactivatedCharts.add(id)}
this._deactivatedChartsSetting.set(Array.from(this._deactivatedCharts))}
setDefaultActiveMetrics(id,active){if(active){this._deactivatedMetrics.delete(id)}else{this._deactivatedMetrics.add(id)}
this._deactivatedMetricsSetting.set(Array.from(this._deactivatedMetrics))}};"use strict"
PlatformPerformance.sortedInsert=function(array,data,key){var i
if(array.length===0){array[0]=data
return}
var val=key(data)
for(i=array.length-1;i>=0;--i){if(key(array[i])>val){array[i+1]=array[i]}else{break}}
array[i+1]=data}
PlatformPerformance.binarySearch=function(array,val,key){var start=0
var end=array.length-1
var idx
while(start<=end){idx=Math.floor((start+end)/2)
let aVal=key(array[idx])
if(aVal<val){start=idx+1}else if(aVal>val){end=idx-1}else{return idx}}
return array.length}
PlatformPerformance.binarySearchLeftmost=function(array,val,key){var start=0
var end=array.length
var idx
while(start<end){idx=Math.floor((start+end)/2)
if(key(array[idx])<val){start=idx+1}else{end=idx}}
if(start<array.length&&key(array[start])===val){return start}else{if(start===0){return array.length}else{return start-1}}}
PlatformPerformance.binarySearchRightmost=function(array,val,key){var start=0
var end=array.length
var idx
while(start<end){idx=Math.floor((start+end)/2)
if(key(array[idx])<=val){start=idx+1}else{end=idx}}
if(start>0&&key(array[start-1])===val){return start-1}
return start};Runtime.cachedResources["platform_performance/performanceMonitor.css"]="/*\n * Copyright 2017 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.perfmon-pane {\n  overflow-y: scroll;\n}\n\n.perfmon-control-pane {\n  display: inline-block;\n  flex-direction: column;\n  width: 250px;\n  overflow-x: hidden;\n  overflow-y: scroll;\n}\n\n.perfmon-indicator {\n  display: flex;\n  flex-wrap: wrap;\n  flex-shrink: 0;\n  width: 100%;\n}\n\n.perfmon-indicator div:first-child {\n  margin-left: 4px;\n}\n\n.perfmon-chart-indicator-title ~ .perfmon-indicator div:first-child {\n  margin-left: 12px;\n}\n\n.perfmon-chart-indicator.active .perfmon-indicator.highlight.active, .perfmon-chart-indicator.highlight.active {\n  background-color: #e4e4ff;\n  font-weight: 600;\n}\n\n.perfmon-chart-indicator:not(.active) * {\n  color: #aaa;\n}\n\n.perfmon-indicator-swatch {\n  flex-basis: 10px;\n  flex-shrink: 0;\n  flex-grow: 0;\n  border-radius: 10px;\n  border: 1px solid #ccc;\n  margin-right: 6px;\n  margin-top: 1px;\n  height: 10px;\n}\n\n.perfmon-indicator:not(.active) .perfmon-indicator-swatch {\n  border-color: #ccc !important;\n}\n\n.perfmon-chart-indicator:not(.active) .perfmon-indicator-swatch {\n  border-color: #ccc !important;\n}\n\n.perfmon-indicator-title {\n  flex-grow: 2;\n  flex-shrink: 0;\n}\n\n.perfmon-indicator:not(.active) {\n  color: #aaa;\n}\n\n.perfmon-indicator:not(.active) span {\n  color: #aaa;\n}\n\n.perfmon-indicator-title-target {\n  flex-shrink: 2;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  white-space: nowrap;\n}\n\n.perfmon-indicator-title-target:not(:empty) {\n  margin-left: 4px;\n}\n\n.perfmon-indicator-title-target:hover {\n  font-weight: bold;\n}\n\n.perfmon-indicator-value {\n  flex-grow: 1;\n  flex-shrink: 0;\n  text-align: right;\n  overflow: visible;\n  margin-right: 4px;\n}\n\n.perfmon-indicator:not(.active) .perfmon-indicator-value {\n  opacity: 0;\n}\n\n.perfmon-chart-indicator:not(.active) .perfmon-indicator-value {\n  opacity: 0;\n}\n\n.perfmon-chart-indicator > div {\n  margin-top: 6px;\n  margin-bottom: 6px;\n}\n\n.perfmon-chart-indicator-title {\n  display: flex;\n  justify-content: space-between\n}\n\n.perfmon-chart-indicator-title > span:nth-child(1) {\n  margin-left: 2px;\n  flex-grow: 1;\n  flex-shrink: 1;\n  text-overflow: ellipsis;\n  overflow: hidden;\n  white-space: nowrap;\n}\n\n.perfmon-chart-indicator-title > span:nth-child(2) {\n  flex-grow: 0;\n  flex-shrink: 0;\n}\n\n.perfmon-chart-indicator-title button {\n  border: 0;\n  background: light-grey;\n  box-shadow: none;\n  border-radius: 0px;\n}\n\n.perfmon-canvas-container {\n  display: flex;\n  flex: 1 1;\n  border-left: 1px solid #ccc;\n  width: 100%;\n  height: 100%;\n  position: relative;\n}\n\n.perfmon-canvas-container canvas{\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n}\n\n.perfmon-back-container {\n  width:100%;\n  height:100%;\n  position: absolute;\n}\n\n.perfmon-save-container {\n  border: 1px solid #aaa;\n  background-color: white;\n  position: fixed;\n  left: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n  padding:20px;\n  width:300px;\n}\n\n.perfmon-name-container, .perfmon-format-container, .perfmon-button-container {\n  width:260px;\n  margin:6px 0px;\n  margin-right:0px;\n}\n\n.perfmon-button-container {\n  text-align:right;\n}\n\n.perfmon-cancel-button {\n  margin-left:6px;\n}\n\n.perfmon-name-pane, .perfmon-format-pane {\n  padding-right:6px;\n  display:inline-block;\n  text-align: right;\n  width:40%;\n}\n\n.perfmon-name-input, .perfmon-format-select {\n  padding:0px;\n  width:60%\n}\n\n\n/*# sourceURL=platform_performance/performanceMonitor.css */";