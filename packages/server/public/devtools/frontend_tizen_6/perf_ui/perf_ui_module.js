PerfUI.ChartViewportDelegate=function(){};PerfUI.ChartViewportDelegate.prototype={windowChanged(startTime,endTime,animate){},updateRangeSelection(startTime,endTime){},setSize(width,height){},update(){}};PerfUI.ChartViewport=class extends UI.VBox{constructor(delegate){super();this.registerRequiredCSS('perf_ui/chartViewport.css');this._delegate=delegate;this.viewportElement=this.contentElement.createChild('div','fill');this.viewportElement.addEventListener('mousemove',this._updateCursorPosition.bind(this),false);this.viewportElement.addEventListener('mouseout',this._onMouseOut.bind(this),false);this.viewportElement.addEventListener('mousewheel',this._onMouseWheel.bind(this),false);this.viewportElement.addEventListener('keydown',this._onChartKeyDown.bind(this),false);this.viewportElement.addEventListener('keyup',this._onChartKeyUp.bind(this),false);UI.installDragHandle(this.viewportElement,this._startDragging.bind(this),this._dragging.bind(this),this._endDragging.bind(this),'-webkit-grabbing',null);UI.installDragHandle(this.viewportElement,this._startRangeSelection.bind(this),this._rangeSelectionDragging.bind(this),this._endRangeSelection.bind(this),'text',null);this._alwaysShowVerticalScroll=false;this._rangeSelectionEnabled=true;this._vScrollElement=this.contentElement.createChild('div','chart-viewport-v-scroll');this._vScrollContent=this._vScrollElement.createChild('div');this._vScrollElement.addEventListener('scroll',this._onScroll.bind(this),false);this._selectionOverlay=this.contentElement.createChild('div','chart-viewport-selection-overlay hidden');this._selectedTimeSpanLabel=this._selectionOverlay.createChild('div','time-span');this._cursorElement=this.contentElement.createChild('div','chart-cursor-element hidden');this.reset();}
alwaysShowVerticalScroll(){this._alwaysShowVerticalScroll=true;this._vScrollElement.classList.add('always-show-scrollbar');}
disableRangeSelection(){this._rangeSelectionEnabled=false;this._rangeSelectionStart=null;this._rangeSelectionEnd=null;this._updateRangeSelectionOverlay();}
isDragging(){return this._isDragging;}
elementsToRestoreScrollPositionsFor(){return[this._vScrollElement];}
_updateScrollBar(){const showScroll=this._alwaysShowVerticalScroll||this._totalHeight>this._offsetHeight;if(this._vScrollElement.classList.contains('hidden')!==showScroll)
return;this._vScrollElement.classList.toggle('hidden',!showScroll);this._updateContentElementSize();}
onResize(){this._updateScrollBar();this._updateContentElementSize();this.scheduleUpdate();}
reset(){this._vScrollElement.scrollTop=0;this._scrollTop=0;this._rangeSelectionStart=null;this._rangeSelectionEnd=null;this._isDragging=false;this._dragStartPointX=0;this._dragStartPointY=0;this._dragStartScrollTop=0;this._visibleLeftTime=0;this._visibleRightTime=0;this._offsetWidth=0;this._offsetHeight=0;this._totalHeight=0;this._targetLeftTime=0;this._targetRightTime=0;this._updateContentElementSize();}
_updateContentElementSize(){let offsetWidth=this._vScrollElement.offsetLeft;if(!offsetWidth)
offsetWidth=this.contentElement.offsetWidth;this._offsetWidth=offsetWidth;this._offsetHeight=this.contentElement.offsetHeight;this._delegate.setSize(this._offsetWidth,this._offsetHeight);}
setContentHeight(totalHeight){this._totalHeight=totalHeight;this._vScrollContent.style.height=totalHeight+'px';this._updateScrollBar();if(this._scrollTop+this._offsetHeight<=totalHeight)
return;this._scrollTop=Math.max(0,totalHeight-this._offsetHeight);this._vScrollElement.scrollTop=this._scrollTop;}
setScrollOffset(offset,height){height=height||0;if(this._vScrollElement.scrollTop>offset)
this._vScrollElement.scrollTop=offset;else if(this._vScrollElement.scrollTop<offset-this._offsetHeight+height)
this._vScrollElement.scrollTop=offset-this._offsetHeight+height;}
scrollOffset(){return this._vScrollElement.scrollTop;}
setBoundaries(zeroTime,totalTime){this._minimumBoundary=zeroTime;this._totalTime=totalTime;}
_onMouseWheel(e){const doZoomInstead=e.shiftKey^(Common.moduleSetting('flamechartMouseWheelAction').get()==='zoom');const panVertically=!doZoomInstead&&(e.wheelDeltaY||Math.abs(e.wheelDeltaX)===120);const panHorizontally=doZoomInstead&&Math.abs(e.wheelDeltaX)>Math.abs(e.wheelDeltaY);if(panVertically){this._vScrollElement.scrollTop-=(e.wheelDeltaY||e.wheelDeltaX)/120*this._offsetHeight/8;}else if(panHorizontally){this._handlePanGesture(-e.wheelDeltaX,true);}else{const mouseWheelZoomSpeed=1/120;this._handleZoomGesture(Math.pow(1.2,-(e.wheelDeltaY||e.wheelDeltaX)*mouseWheelZoomSpeed)-1);}
e.consume(true);}
_startDragging(event){if(event.shiftKey)
return false;this._isDragging=true;this._dragStartPointX=event.pageX;this._dragStartPointY=event.pageY;this._dragStartScrollTop=this._vScrollElement.scrollTop;this.viewportElement.style.cursor='';return true;}
_dragging(event){const pixelShift=this._dragStartPointX-event.pageX;this._dragStartPointX=event.pageX;this._handlePanGesture(pixelShift);const pixelScroll=this._dragStartPointY-event.pageY;this._vScrollElement.scrollTop=this._dragStartScrollTop+pixelScroll;}
_endDragging(){this._isDragging=false;}
_startRangeSelection(event){if(!event.shiftKey||!this._rangeSelectionEnabled)
return false;this._isDragging=true;this._selectionOffsetShiftX=event.offsetX-event.pageX;this._selectionOffsetShiftY=event.offsetY-event.pageY;this._selectionStartX=event.offsetX;const style=this._selectionOverlay.style;style.left=this._selectionStartX+'px';style.width='1px';this._selectedTimeSpanLabel.textContent='';this._selectionOverlay.classList.remove('hidden');return true;}
_endRangeSelection(){this._isDragging=false;this._selectionStartX=null;}
hideRangeSelection(){this._selectionOverlay.classList.add('hidden');this._rangeSelectionStart=null;this._rangeSelectionEnd=null;}
setRangeSelection(startTime,endTime){if(!this._rangeSelectionEnabled)
return;this._rangeSelectionStart=Math.min(startTime,endTime);this._rangeSelectionEnd=Math.max(startTime,endTime);this._updateRangeSelectionOverlay();this._delegate.updateRangeSelection(this._rangeSelectionStart,this._rangeSelectionEnd);}
onClick(event){const time=this.pixelToTime(event.offsetX);if(this._rangeSelectionStart!==null&&time>=this._rangeSelectionStart&&time<=this._rangeSelectionEnd)
return;this.hideRangeSelection();}
_rangeSelectionDragging(event){const x=Number.constrain(event.pageX+this._selectionOffsetShiftX,0,this._offsetWidth);const start=this.pixelToTime(this._selectionStartX);const end=this.pixelToTime(x);this.setRangeSelection(start,end);}
_updateRangeSelectionOverlay(){const margin=100;const left=Number.constrain(this.timeToPosition(this._rangeSelectionStart),-margin,this._offsetWidth+margin);const right=Number.constrain(this.timeToPosition(this._rangeSelectionEnd),-margin,this._offsetWidth+margin);const style=this._selectionOverlay.style;style.left=left+'px';style.width=(right-left)+'px';const timeSpan=this._rangeSelectionEnd-this._rangeSelectionStart;this._selectedTimeSpanLabel.textContent=Number.preciseMillisToString(timeSpan,2);}
_onScroll(){this._scrollTop=this._vScrollElement.scrollTop;this.scheduleUpdate();}
_onMouseOut(){this._lastMouseOffsetX=-1;this._showCursor(false);}
_updateCursorPosition(e){this._showCursor(e.shiftKey);this._cursorElement.style.left=e.offsetX+'px';this._lastMouseOffsetX=e.offsetX;}
pixelToTime(x){return this.pixelToTimeOffset(x)+this._visibleLeftTime;}
pixelToTimeOffset(x){return x*(this._visibleRightTime-this._visibleLeftTime)/this._offsetWidth;}
timeToPosition(time){return Math.floor((time-this._visibleLeftTime)/(this._visibleRightTime-this._visibleLeftTime)*this._offsetWidth);}
timeToPixel(){return this._offsetWidth/(this._visibleRightTime-this._visibleLeftTime);}
_showCursor(visible){this._cursorElement.classList.toggle('hidden',!visible||this._isDragging);}
_onChartKeyDown(e){this._showCursor(e.shiftKey);this._handleZoomPanKeys(e);}
_onChartKeyUp(e){this._showCursor(e.shiftKey);}
_handleZoomPanKeys(e){if(!UI.KeyboardShortcut.hasNoModifiers(e))
return;const zoomFactor=e.shiftKey?0.8:0.3;const panOffset=e.shiftKey?320:160;switch(e.code){case'KeyA':this._handlePanGesture(-panOffset,true);break;case'KeyD':this._handlePanGesture(panOffset,true);break;case'KeyW':this._handleZoomGesture(-zoomFactor);break;case'KeyS':this._handleZoomGesture(zoomFactor);break;default:return;}
e.consume(true);}
_handleZoomGesture(zoom){const bounds={left:this._targetLeftTime,right:this._targetRightTime};const cursorTime=this.pixelToTime(this._lastMouseOffsetX);bounds.left+=(bounds.left-cursorTime)*zoom;bounds.right+=(bounds.right-cursorTime)*zoom;this._requestWindowTimes(bounds,true);}
_handlePanGesture(offset,animate){const bounds={left:this._targetLeftTime,right:this._targetRightTime};const timeOffset=Number.constrain(this.pixelToTimeOffset(offset),this._minimumBoundary-bounds.left,this._totalTime+this._minimumBoundary-bounds.right);bounds.left+=timeOffset;bounds.right+=timeOffset;this._requestWindowTimes(bounds,!!animate);}
_requestWindowTimes(bounds,animate){const maxBound=this._minimumBoundary+this._totalTime;if(bounds.left<this._minimumBoundary){bounds.right=Math.min(bounds.right+this._minimumBoundary-bounds.left,maxBound);bounds.left=this._minimumBoundary;}else if(bounds.right>maxBound){bounds.left=Math.max(bounds.left-bounds.right+maxBound,this._minimumBoundary);bounds.right=maxBound;}
if(bounds.right-bounds.left<PerfUI.FlameChart.MinimalTimeWindowMs)
return;this._delegate.windowChanged(bounds.left,bounds.right,animate);}
scheduleUpdate(){if(this._updateTimerId||this._cancelWindowTimesAnimation)
return;this._updateTimerId=this.element.window().requestAnimationFrame(()=>{this._updateTimerId=0;this._update();});}
_update(){this._updateRangeSelectionOverlay();this._delegate.update();}
setWindowTimes(startTime,endTime,animate){if(startTime===this._targetLeftTime&&endTime===this._targetRightTime)
return;if(!animate||this._visibleLeftTime===0||this._visibleRightTime===Infinity||(startTime===0&&endTime===Infinity)||(startTime===Infinity&&endTime===Infinity)){this._targetLeftTime=startTime;this._targetRightTime=endTime;this._visibleLeftTime=startTime;this._visibleRightTime=endTime;this.scheduleUpdate();return;}
if(this._cancelWindowTimesAnimation){this._cancelWindowTimesAnimation();this._visibleLeftTime=this._targetLeftTime;this._visibleRightTime=this._targetRightTime;}
this._targetLeftTime=startTime;this._targetRightTime=endTime;this._cancelWindowTimesAnimation=UI.animateFunction(this.element.window(),animateWindowTimes.bind(this),[{from:this._visibleLeftTime,to:startTime},{from:this._visibleRightTime,to:endTime}],100,()=>this._cancelWindowTimesAnimation=null);function animateWindowTimes(startTime,endTime){this._visibleLeftTime=startTime;this._visibleRightTime=endTime;this._update();}}
windowLeftTime(){return this._visibleLeftTime;}
windowRightTime(){return this._visibleRightTime;}};;PerfUI.FilmStripView=class extends UI.HBox{constructor(){super(true);this.registerRequiredCSS('perf_ui/filmStripView.css');this.contentElement.classList.add('film-strip-view');this._statusLabel=this.contentElement.createChild('div','label');this.reset();this.setMode(PerfUI.FilmStripView.Modes.TimeBased);}
static _setImageData(imageElement,data){if(data)
imageElement.src='data:image/jpg;base64,'+data;}
setMode(mode){this._mode=mode;this.contentElement.classList.toggle('time-based',mode===PerfUI.FilmStripView.Modes.TimeBased);this.update();}
setModel(filmStripModel,zeroTime,spanTime){this._model=filmStripModel;this._zeroTime=zeroTime;this._spanTime=spanTime;const frames=filmStripModel.frames();if(!frames.length){this.reset();return;}
this.update();}
createFrameElement(frame){const time=frame.timestamp;const element=createElementWithClass('div','frame');element.title=Common.UIString('Doubleclick to zoom image. Click to view preceding requests.');element.createChild('div','time').textContent=Number.millisToString(time-this._zeroTime);const imageElement=element.createChild('div','thumbnail').createChild('img');element.addEventListener('mousedown',this._onMouseEvent.bind(this,PerfUI.FilmStripView.Events.FrameSelected,time),false);element.addEventListener('mouseenter',this._onMouseEvent.bind(this,PerfUI.FilmStripView.Events.FrameEnter,time),false);element.addEventListener('mouseout',this._onMouseEvent.bind(this,PerfUI.FilmStripView.Events.FrameExit,time),false);element.addEventListener('dblclick',this._onDoubleClick.bind(this,frame),false);return frame.imageDataPromise().then(PerfUI.FilmStripView._setImageData.bind(null,imageElement)).then(returnElement);function returnElement(){return element;}}
frameByTime(time){function comparator(time,frame){return time-frame.timestamp;}
const frames=this._model.frames();const index=Math.max(frames.upperBound(time,comparator)-1,0);return frames[index];}
update(){if(!this._model)
return;const frames=this._model.frames();if(!frames.length)
return;if(this._mode===PerfUI.FilmStripView.Modes.FrameBased){Promise.all(frames.map(this.createFrameElement.bind(this))).then(appendElements.bind(this));return;}
const width=this.contentElement.clientWidth;const scale=this._spanTime/width;this.createFrameElement(frames[0]).then(continueWhenFrameImageLoaded.bind(this));function continueWhenFrameImageLoaded(element0){const frameWidth=Math.ceil(UI.measurePreferredSize(element0,this.contentElement).width);if(!frameWidth)
return;const promises=[];for(let pos=frameWidth;pos<width;pos+=frameWidth){const time=pos*scale+this._zeroTime;promises.push(this.createFrameElement(this.frameByTime(time)).then(fixWidth));}
Promise.all(promises).then(appendElements.bind(this));function fixWidth(element){element.style.width=frameWidth+'px';return element;}}
function appendElements(elements){this.contentElement.removeChildren();for(let i=0;i<elements.length;++i)
this.contentElement.appendChild(elements[i]);}}
onResize(){if(this._mode===PerfUI.FilmStripView.Modes.FrameBased)
return;this.update();}
_onMouseEvent(eventName,timestamp){this.dispatchEventToListeners(eventName,timestamp);}
_onDoubleClick(filmStripFrame){new PerfUI.FilmStripView.Dialog(filmStripFrame,this._zeroTime);}
reset(){this._zeroTime=0;this.contentElement.removeChildren();this.contentElement.appendChild(this._statusLabel);}
setStatusText(text){this._statusLabel.textContent=text;}};PerfUI.FilmStripView.Events={FrameSelected:Symbol('FrameSelected'),FrameEnter:Symbol('FrameEnter'),FrameExit:Symbol('FrameExit'),};PerfUI.FilmStripView.Modes={TimeBased:'TimeBased',FrameBased:'FrameBased'};PerfUI.FilmStripView.Dialog=class{constructor(filmStripFrame,zeroTime){const prevButton=UI.createTextButton('\u25C0',this._onPrevFrame.bind(this));prevButton.title=Common.UIString('Previous frame');const nextButton=UI.createTextButton('\u25B6',this._onNextFrame.bind(this));nextButton.title=Common.UIString('Next frame');this._fragment=UI.Fragment.build`
      <x-widget flex=none margin=12px>
        <x-hbox overflow=auto border='1px solid #ddd' max-height=80vh max-width=80vw>
          <img $=image></img>
        </x-hbox>
        <x-hbox x-center justify-content=center margin-top=10px>
          ${prevButton}
          <x-hbox $=time margin=8px></x-hbox>
          ${nextButton}
        </x-hbox>
      </x-widget>
    `;this._widget=(this._fragment.element());this._widget.tabIndex=0;this._widget.addEventListener('keydown',this._keyDown.bind(this),false);this._frames=filmStripFrame.model().frames();this._index=filmStripFrame.index;this._zeroTime=zeroTime||filmStripFrame.model().zeroTime();this._dialog=null;this._render();}
_resize(){if(!this._dialog){this._dialog=new UI.Dialog();this._dialog.contentElement.appendChild(this._widget);this._dialog.setDefaultFocusedElement(this._widget);this._dialog.show();}
this._dialog.setSizeBehavior(UI.GlassPane.SizeBehavior.MeasureContent);}
_keyDown(event){switch(event.key){case'ArrowLeft':if(Host.isMac()&&event.metaKey)
this._onFirstFrame();else
this._onPrevFrame();break;case'ArrowRight':if(Host.isMac()&&event.metaKey)
this._onLastFrame();else
this._onNextFrame();break;case'Home':this._onFirstFrame();break;case'End':this._onLastFrame();break;}}
_onPrevFrame(){if(this._index>0)
--this._index;this._render();}
_onNextFrame(){if(this._index<this._frames.length-1)
++this._index;this._render();}
_onFirstFrame(){this._index=0;this._render();}
_onLastFrame(){this._index=this._frames.length-1;this._render();}
_render(){const frame=this._frames[this._index];this._fragment.$('time').textContent=Number.millisToString(frame.timestamp-this._zeroTime);return frame.imageDataPromise().then(PerfUI.FilmStripView._setImageData.bind(null,this._fragment.$('image'))).then(this._resize.bind(this));}};;PerfUI.FlameChartDelegate=function(){};PerfUI.FlameChartDelegate.prototype={windowChanged(startTime,endTime,animate){},updateRangeSelection(startTime,endTime){},updateSelectedGroup(flameChart,group){},};PerfUI.FlameChart=class extends UI.VBox{constructor(dataProvider,flameChartDelegate,groupExpansionSetting){super(true);this.registerRequiredCSS('perf_ui/flameChart.css');this.contentElement.classList.add('flame-chart-main-pane');this._groupExpansionSetting=groupExpansionSetting;this._groupExpansionState=groupExpansionSetting&&groupExpansionSetting.get()||{};this._flameChartDelegate=flameChartDelegate;this._useWebGL=Runtime.experiments.isEnabled('timelineWebGL');this._chartViewport=new PerfUI.ChartViewport(this);this._chartViewport.show(this.contentElement);this._dataProvider=dataProvider;this._viewportElement=this._chartViewport.viewportElement;if(this._useWebGL){this._canvasGL=(this._viewportElement.createChild('canvas','fill'));this._initWebGL();}
this._canvas=(this._viewportElement.createChild('canvas','fill'));this._canvas.tabIndex=0;this.setDefaultFocusedElement(this._canvas);this._canvas.addEventListener('mousemove',this._onMouseMove.bind(this),false);this._canvas.addEventListener('mouseout',this._onMouseOut.bind(this),false);this._canvas.addEventListener('click',this._onClick.bind(this),false);this._canvas.addEventListener('keydown',this._onKeyDown.bind(this),false);this._entryInfo=this._viewportElement.createChild('div','flame-chart-entry-info');this._markerHighlighElement=this._viewportElement.createChild('div','flame-chart-marker-highlight-element');this._highlightElement=this._viewportElement.createChild('div','flame-chart-highlight-element');this._selectedElement=this._viewportElement.createChild('div','flame-chart-selected-element');UI.installDragHandle(this._viewportElement,this._startDragging.bind(this),this._dragging.bind(this),this._endDragging.bind(this),null);this._rulerEnabled=true;this._rangeSelectionStart=0;this._rangeSelectionEnd=0;this._barHeight=17;this._textBaseline=5;this._textPadding=5;this._markerRadius=6;this._chartViewport.setWindowTimes(dataProvider.minimumBoundary(),dataProvider.minimumBoundary()+dataProvider.totalTime());this._headerLeftPadding=6;this._arrowSide=8;this._expansionArrowIndent=this._headerLeftPadding+this._arrowSide/2;this._headerLabelXPadding=3;this._headerLabelYPadding=2;this._highlightedMarkerIndex=-1;this._highlightedEntryIndex=-1;this._selectedEntryIndex=-1;this._rawTimelineDataLength=0;this._textWidth=new Map();this._markerPositions=new Map();this._lastMouseOffsetX=0;this._selectedGroup=-1;this._selectedGroupBackroundColor=UI.themeSupport.patchColorText(PerfUI.FlameChart.Colors.SelectedGroupBackground,UI.ThemeSupport.ColorUsage.Background);this._selectedGroupBorderColor=UI.themeSupport.patchColorText(PerfUI.FlameChart.Colors.SelectedGroupBorder,UI.ThemeSupport.ColorUsage.Background);}
willHide(){this.hideHighlight();}
setBarHeight(value){this._barHeight=value;}
setTextBaseline(value){this._textBaseline=value;}
setTextPadding(value){this._textPadding=value;}
enableRuler(enable){this._rulerEnabled=enable;}
alwaysShowVerticalScroll(){this._chartViewport.alwaysShowVerticalScroll();}
disableRangeSelection(){this._chartViewport.disableRangeSelection();}
highlightEntry(entryIndex){if(this._highlightedEntryIndex===entryIndex)
return;if(!this._dataProvider.entryColor(entryIndex))
return;this._highlightedEntryIndex=entryIndex;this._updateElementPosition(this._highlightElement,this._highlightedEntryIndex);this.dispatchEventToListeners(PerfUI.FlameChart.Events.EntryHighlighted,entryIndex);}
hideHighlight(){this._entryInfo.removeChildren();this._highlightedEntryIndex=-1;this._updateElementPosition(this._highlightElement,this._highlightedEntryIndex);this.dispatchEventToListeners(PerfUI.FlameChart.Events.EntryHighlighted,-1);}
_resetCanvas(){const ratio=window.devicePixelRatio;const width=Math.round(this._offsetWidth*ratio);const height=Math.round(this._offsetHeight*ratio);this._canvas.width=width;this._canvas.height=height;this._canvas.style.width=`${width / ratio}px`;this._canvas.style.height=`${height / ratio}px`;if(this._useWebGL){this._canvasGL.width=width;this._canvasGL.height=height;this._canvasGL.style.width=`${width / ratio}px`;this._canvasGL.style.height=`${height / ratio}px`;}}
windowChanged(startTime,endTime,animate){this._flameChartDelegate.windowChanged(startTime,endTime,animate);}
updateRangeSelection(startTime,endTime){this._flameChartDelegate.updateRangeSelection(startTime,endTime);}
setSize(width,height){this._offsetWidth=width;this._offsetHeight=height;}
_startDragging(event){this.hideHighlight();this._maxDragOffset=0;this._dragStartX=event.pageX;this._dragStartY=event.pageY;return true;}
_dragging(event){const dx=event.pageX-this._dragStartX;const dy=event.pageY-this._dragStartY;this._maxDragOffset=Math.max(this._maxDragOffset,Math.sqrt(dx*dx+dy*dy));}
_endDragging(event){this._updateHighlight();}
_timelineData(){if(!this._dataProvider)
return null;const timelineData=this._dataProvider.timelineData();if(timelineData!==this._rawTimelineData||timelineData.entryStartTimes.length!==this._rawTimelineDataLength)
this._processTimelineData(timelineData);return this._rawTimelineData;}
_revealEntry(entryIndex){const timelineData=this._timelineData();if(!timelineData)
return;const timeLeft=this._chartViewport.windowLeftTime();const timeRight=this._chartViewport.windowRightTime();const entryStartTime=timelineData.entryStartTimes[entryIndex];const entryTotalTime=timelineData.entryTotalTimes[entryIndex];const entryEndTime=entryStartTime+entryTotalTime;let minEntryTimeWindow=Math.min(entryTotalTime,timeRight-timeLeft);const level=timelineData.entryLevels[entryIndex];this._chartViewport.setScrollOffset(this._levelToOffset(level),this._levelHeight(level));const minVisibleWidthPx=30;const futurePixelToTime=(timeRight-timeLeft)/this._offsetWidth;minEntryTimeWindow=Math.max(minEntryTimeWindow,futurePixelToTime*minVisibleWidthPx);if(timeLeft>entryEndTime){const delta=timeLeft-entryEndTime+minEntryTimeWindow;this.windowChanged(timeLeft-delta,timeRight-delta,true);}else if(timeRight<entryStartTime){const delta=entryStartTime-timeRight+minEntryTimeWindow;this.windowChanged(timeLeft+delta,timeRight+delta,true);}}
setWindowTimes(startTime,endTime,animate){this._chartViewport.setWindowTimes(startTime,endTime,animate);this._updateHighlight();}
_onMouseMove(event){this._lastMouseOffsetX=event.offsetX;this._lastMouseOffsetY=event.offsetY;if(!this._enabled())
return;if(this._chartViewport.isDragging())
return;if(this._coordinatesToGroupIndex(event.offsetX,event.offsetY,true)>=0){this.hideHighlight();this._viewportElement.style.cursor='pointer';return;}
this._updateHighlight();}
_updateHighlight(){const entryIndex=this._coordinatesToEntryIndex(this._lastMouseOffsetX,this._lastMouseOffsetY);if(entryIndex===-1){this.hideHighlight();const group=this._coordinatesToGroupIndex(this._lastMouseOffsetX,this._lastMouseOffsetY,false);if(group>=0&&this._rawTimelineData.groups[group].selectable)
this._viewportElement.style.cursor='pointer';else
this._viewportElement.style.cursor='default';return;}
if(this._chartViewport.isDragging())
return;this._updatePopover(entryIndex);this._viewportElement.style.cursor=this._dataProvider.canJumpToEntry(entryIndex)?'pointer':'default';this.highlightEntry(entryIndex);}
_onMouseOut(){this._lastMouseOffsetX=-1;this._lastMouseOffsetY=-1;this.hideHighlight();}
_updatePopover(entryIndex){if(entryIndex===this._highlightedEntryIndex){this._updatePopoverOffset();return;}
this._entryInfo.removeChildren();const popoverElement=this._dataProvider.prepareHighlightedEntryInfo(entryIndex);if(popoverElement){this._entryInfo.appendChild(popoverElement);this._updatePopoverOffset();}}
_updatePopoverOffset(){const mouseX=this._lastMouseOffsetX;const mouseY=this._lastMouseOffsetY;const parentWidth=this._entryInfo.parentElement.clientWidth;const parentHeight=this._entryInfo.parentElement.clientHeight;const infoWidth=this._entryInfo.clientWidth;const infoHeight=this._entryInfo.clientHeight;const offsetX=10;const offsetY=6;let x;let y;for(let quadrant=0;quadrant<4;++quadrant){const dx=quadrant&2?-offsetX-infoWidth:offsetX;const dy=quadrant&1?-offsetY-infoHeight:offsetY;x=Number.constrain(mouseX+dx,0,parentWidth-infoWidth);y=Number.constrain(mouseY+dy,0,parentHeight-infoHeight);if(x>=mouseX||mouseX>=x+infoWidth||y>=mouseY||mouseY>=y+infoHeight)
break;}
this._entryInfo.style.left=x+'px';this._entryInfo.style.top=y+'px';}
_onClick(event){this.focus();const clickThreshold=5;if(this._maxDragOffset>clickThreshold)
return;this._selectGroup(this._coordinatesToGroupIndex(event.offsetX,event.offsetY,false));this._toggleGroupVisibility(this._coordinatesToGroupIndex(event.offsetX,event.offsetY,true));const timelineData=this._timelineData();if(event.shiftKey&&this._highlightedEntryIndex!==-1&&timelineData){const start=timelineData.entryStartTimes[this._highlightedEntryIndex];const end=start+timelineData.entryTotalTimes[this._highlightedEntryIndex];this._chartViewport.setRangeSelection(start,end);}else{this._chartViewport.onClick(event);this.dispatchEventToListeners(PerfUI.FlameChart.Events.EntrySelected,this._highlightedEntryIndex);}}
_selectGroup(groupIndex){const groups=this._rawTimelineData.groups;if(groupIndex<0||!groups[groupIndex].selectable||this._selectedGroup===groupIndex)
return;this._selectedGroup=groupIndex;this._flameChartDelegate.updateSelectedGroup(this,groups[groupIndex]);this._resetCanvas();this._draw();}
_toggleGroupVisibility(groupIndex){if(groupIndex<0||!this._isGroupCollapsible(groupIndex))
return;const groups=this._rawTimelineData.groups;const group=groups[groupIndex];group.expanded=!group.expanded;this._groupExpansionState[group.name]=group.expanded;if(this._groupExpansionSetting)
this._groupExpansionSetting.set(this._groupExpansionState);this._updateLevelPositions();this._updateHighlight();if(!group.expanded){const timelineData=this._timelineData();const level=timelineData.entryLevels[this._selectedEntryIndex];if(this._selectedEntryIndex>=0&&level>=group.startLevel&&(groupIndex>=groups.length-1||groups[groupIndex+1].startLevel>level))
this._selectedEntryIndex=-1;}
this._updateHeight();this._resetCanvas();this._draw();}
_onKeyDown(e){this._handleSelectionNavigation(e);}
_handleSelectionNavigation(e){if(!UI.KeyboardShortcut.hasNoModifiers(e))
return;if(this._selectedEntryIndex===-1)
return;const timelineData=this._timelineData();if(!timelineData)
return;function timeComparator(time,entryIndex){return time-timelineData.entryStartTimes[entryIndex];}
function entriesIntersect(entry1,entry2){const start1=timelineData.entryStartTimes[entry1];const start2=timelineData.entryStartTimes[entry2];const end1=start1+timelineData.entryTotalTimes[entry1];const end2=start2+timelineData.entryTotalTimes[entry2];return start1<end2&&start2<end1;}
const keys=UI.KeyboardShortcut.Keys;if(e.keyCode===keys.Left.code||e.keyCode===keys.Right.code){const level=timelineData.entryLevels[this._selectedEntryIndex];const levelIndexes=this._timelineLevels[level];let indexOnLevel=levelIndexes.lowerBound(this._selectedEntryIndex);indexOnLevel+=e.keyCode===keys.Left.code?-1:1;e.consume(true);if(indexOnLevel>=0&&indexOnLevel<levelIndexes.length)
this.dispatchEventToListeners(PerfUI.FlameChart.Events.EntrySelected,levelIndexes[indexOnLevel]);return;}
if(e.keyCode===keys.Up.code||e.keyCode===keys.Down.code){e.consume(true);let level=timelineData.entryLevels[this._selectedEntryIndex];level+=e.keyCode===keys.Up.code?-1:1;if(level<0||level>=this._timelineLevels.length)
return;const entryTime=timelineData.entryStartTimes[this._selectedEntryIndex]+
timelineData.entryTotalTimes[this._selectedEntryIndex]/2;const levelIndexes=this._timelineLevels[level];let indexOnLevel=levelIndexes.upperBound(entryTime,timeComparator)-1;if(!entriesIntersect(this._selectedEntryIndex,levelIndexes[indexOnLevel])){++indexOnLevel;if(indexOnLevel>=levelIndexes.length||!entriesIntersect(this._selectedEntryIndex,levelIndexes[indexOnLevel]))
return;}
this.dispatchEventToListeners(PerfUI.FlameChart.Events.EntrySelected,levelIndexes[indexOnLevel]);}}
_coordinatesToEntryIndex(x,y){if(x<0||y<0)
return-1;const timelineData=this._timelineData();if(!timelineData)
return-1;y+=this._chartViewport.scrollOffset();const cursorLevel=this._visibleLevelOffsets.upperBound(y)-1;if(cursorLevel<0||!this._visibleLevels[cursorLevel])
return-1;const offsetFromLevel=y-this._visibleLevelOffsets[cursorLevel];if(offsetFromLevel>this._levelHeight(cursorLevel))
return-1;for(const[index,pos]of this._markerPositions){if(timelineData.entryLevels[index]!==cursorLevel)
continue;if(pos.x<=x&&x<pos.x+pos.width)
return(index);}
const entryStartTimes=timelineData.entryStartTimes;const entriesOnLevel=this._timelineLevels[cursorLevel];if(!entriesOnLevel||!entriesOnLevel.length)
return-1;const cursorTime=this._chartViewport.pixelToTime(x);const indexOnLevel=Math.max(entriesOnLevel.upperBound(cursorTime,(time,entryIndex)=>time-entryStartTimes[entryIndex])-1,0);function checkEntryHit(entryIndex){if(entryIndex===undefined)
return false;const startTime=entryStartTimes[entryIndex];const duration=timelineData.entryTotalTimes[entryIndex];const startX=this._chartViewport.timeToPosition(startTime);const endX=this._chartViewport.timeToPosition(startTime+duration);const barThresholdPx=3;return startX-barThresholdPx<x&&x<endX+barThresholdPx;}
let entryIndex=entriesOnLevel[indexOnLevel];if(checkEntryHit.call(this,entryIndex))
return entryIndex;entryIndex=entriesOnLevel[indexOnLevel+1];if(checkEntryHit.call(this,entryIndex))
return entryIndex;return-1;}
_coordinatesToGroupIndex(x,y,headerOnly){if(x<0||y<0)
return-1;y+=this._chartViewport.scrollOffset();const groups=this._rawTimelineData.groups||[];const group=this._groupOffsets.upperBound(y)-1;if(group<0||group>=groups.length)
return-1;const height=headerOnly?groups[group].style.height:this._groupOffsets[group+1]-this._groupOffsets[group];if(y-this._groupOffsets[group]>=height)
return-1;if(!headerOnly)
return group;const context=(this._canvas.getContext('2d'));context.save();context.font=groups[group].style.font;const right=this._headerLeftPadding+this._labelWidthForGroup(context,groups[group]);context.restore();if(x>right)
return-1;return group;}
_markerIndexAtPosition(x){const markers=this._timelineData().markers;if(!markers)
return-1;const accurracyOffsetPx=4;const time=this._chartViewport.pixelToTime(x);const leftTime=this._chartViewport.pixelToTime(x-accurracyOffsetPx);const rightTime=this._chartViewport.pixelToTime(x+accurracyOffsetPx);const left=this._markerIndexBeforeTime(leftTime);let markerIndex=-1;let distance=Infinity;for(let i=left;i<markers.length&&markers[i].startTime()<rightTime;i++){const nextDistance=Math.abs(markers[i].startTime()-time);if(nextDistance<distance){markerIndex=i;distance=nextDistance;}}
return markerIndex;}
_markerIndexBeforeTime(time){return this._timelineData().markers.lowerBound(time,(markerTimestamp,marker)=>markerTimestamp-marker.startTime());}
_draw(){const timelineData=this._timelineData();if(!timelineData)
return;const width=this._offsetWidth;const height=this._offsetHeight;const context=(this._canvas.getContext('2d'));context.save();const ratio=window.devicePixelRatio;const top=this._chartViewport.scrollOffset();context.scale(ratio,ratio);context.fillStyle='rgba(0, 0, 0, 0)';context.fillRect(0,0,width,height);context.translate(0,-top);const defaultFont='11px '+Host.fontFamily();context.font=defaultFont;const entryTotalTimes=timelineData.entryTotalTimes;const entryStartTimes=timelineData.entryStartTimes;const entryLevels=timelineData.entryLevels;const timeToPixel=this._chartViewport.timeToPixel();const titleIndices=[];const markerIndices=[];const textPadding=this._textPadding;const minTextWidth=2*textPadding+UI.measureTextWidth(context,'\u2026');const minTextWidthDuration=this._chartViewport.pixelToTimeOffset(minTextWidth);const minVisibleBarLevel=Math.max(this._visibleLevelOffsets.upperBound(top)-1,0);this._markerPositions.clear();const colorBuckets=new Map();for(let level=minVisibleBarLevel;level<this._dataProvider.maxStackDepth();++level){if(this._levelToOffset(level)>top+height)
break;if(!this._visibleLevels[level])
continue;const levelIndexes=this._timelineLevels[level];const rightIndexOnLevel=levelIndexes.lowerBound(this._chartViewport.windowRightTime(),(time,entryIndex)=>time-entryStartTimes[entryIndex])-
1;let lastDrawOffset=Infinity;for(let entryIndexOnLevel=rightIndexOnLevel;entryIndexOnLevel>=0;--entryIndexOnLevel){const entryIndex=levelIndexes[entryIndexOnLevel];const duration=entryTotalTimes[entryIndex];if(isNaN(duration)){markerIndices.push(entryIndex);continue;}
if(duration>=minTextWidthDuration||this._forceDecorationCache[entryIndex])
titleIndices.push(entryIndex);const entryStartTime=entryStartTimes[entryIndex];const entryOffsetRight=entryStartTime+duration;if(entryOffsetRight<=this._chartViewport.windowLeftTime())
break;if(this._useWebGL)
continue;const barX=this._timeToPositionClipped(entryStartTime);if(barX>=lastDrawOffset)
continue;lastDrawOffset=barX;const color=this._entryColorsCache[entryIndex];let bucket=colorBuckets.get(color);if(!bucket){bucket=[];colorBuckets.set(color,bucket);}
bucket.push(entryIndex);}}
if(this._useWebGL){this._drawGL();}else{context.save();this._forEachGroupInViewport((offset,index,group,isFirst,groupHeight)=>{if(index===this._selectedGroup){context.fillStyle=this._selectedGroupBackroundColor;context.fillRect(0,offset,width,groupHeight-group.style.padding);}});context.restore();for(const[color,indexes]of colorBuckets){context.beginPath();for(let i=0;i<indexes.length;++i){const entryIndex=indexes[i];const duration=entryTotalTimes[entryIndex];if(isNaN(duration))
continue;const entryStartTime=entryStartTimes[entryIndex];const barX=this._timeToPositionClipped(entryStartTime);const barLevel=entryLevels[entryIndex];const barHeight=this._levelHeight(barLevel);const barY=this._levelToOffset(barLevel);const barRight=this._timeToPositionClipped(entryStartTime+duration);const barWidth=Math.max(barRight-barX,1);context.rect(barX,barY,barWidth-0.4,barHeight-1);}
context.fillStyle=color;context.fill();}}
context.textBaseline='alphabetic';context.beginPath();let lastMarkerLevel=-1;let lastMarkerX=-Infinity;for(let m=markerIndices.length-1;m>=0;--m){const entryIndex=markerIndices[m];const title=this._dataProvider.entryTitle(entryIndex);if(!title)
continue;const entryStartTime=entryStartTimes[entryIndex];const level=entryLevels[entryIndex];if(lastMarkerLevel!==level)
lastMarkerX=-Infinity;const x=Math.max(this._chartViewport.timeToPosition(entryStartTime),lastMarkerX);const y=this._levelToOffset(level);const h=this._levelHeight(level);const padding=4;const width=Math.ceil(UI.measureTextWidth(context,title))+2*padding;lastMarkerX=x+width+1;lastMarkerLevel=level;this._markerPositions.set(entryIndex,{x,width});context.fillStyle=this._dataProvider.entryColor(entryIndex);context.fillRect(x,y,width,h-1);context.fillStyle='white';context.fillText(title,x+padding,y+h-this._textBaseline);}
context.strokeStyle='rgba(0, 0, 0, 0.2)';context.stroke();for(let i=0;i<titleIndices.length;++i){const entryIndex=titleIndices[i];const entryStartTime=entryStartTimes[entryIndex];const barX=this._timeToPositionClipped(entryStartTime);const barRight=Math.min(this._timeToPositionClipped(entryStartTime+entryTotalTimes[entryIndex]),width)+1;const barWidth=barRight-barX;const barLevel=entryLevels[entryIndex];const barY=this._levelToOffset(barLevel);let text=this._dataProvider.entryTitle(entryIndex);if(text&&text.length){context.font=this._dataProvider.entryFont(entryIndex)||defaultFont;text=UI.trimTextMiddle(context,text,barWidth-2*textPadding);}
const unclippedBarX=this._chartViewport.timeToPosition(entryStartTime);const barHeight=this._levelHeight(barLevel);if(this._dataProvider.decorateEntry(entryIndex,context,text,barX,barY,barWidth,barHeight,unclippedBarX,timeToPixel))
continue;if(!text||!text.length)
continue;context.fillStyle=this._dataProvider.textColor(entryIndex);context.fillText(text,barX+textPadding,barY+barHeight-this._textBaseline);}
context.restore();this._drawGroupHeaders(width,height);this._drawFlowEvents(context,width,height);this._drawMarkers();const dividersData=PerfUI.TimelineGrid.calculateGridOffsets(this);PerfUI.TimelineGrid.drawCanvasGrid(context,dividersData);if(this._rulerEnabled){PerfUI.TimelineGrid.drawCanvasHeaders(context,dividersData,time=>this.formatValue(time,dividersData.precision),3,PerfUI.FlameChart.HeaderHeight);}
this._updateElementPosition(this._highlightElement,this._highlightedEntryIndex);this._updateElementPosition(this._selectedElement,this._selectedEntryIndex);this._updateMarkerHighlight();}
_initWebGL(){const gl=(this._canvasGL.getContext('webgl'));if(!gl){console.error('Failed to obtain WebGL context.');this._useWebGL=false;return;}
const vertexShaderSource=`
      attribute vec2 aVertexPosition;
      attribute float aVertexColor;

      uniform vec2 uScalingFactor;
      uniform vec2 uShiftVector;

      varying mediump vec2 vPalettePosition;

      void main() {
        vec2 shiftedPosition = aVertexPosition - uShiftVector;
        gl_Position = vec4(shiftedPosition * uScalingFactor + vec2(-1.0, 1.0), 0.0, 1.0);
        vPalettePosition = vec2(aVertexColor, 0.5);
      }`;const fragmentShaderSource=`
      varying mediump vec2 vPalettePosition;
      uniform sampler2D uSampler;

      void main() {
        gl_FragColor = texture2D(uSampler, vPalettePosition);
      }`;function loadShader(gl,type,source){const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(gl.getShaderParameter(shader,gl.COMPILE_STATUS))
return shader;console.error('Shader compile error: '+gl.getShaderInfoLog(shader));gl.deleteShader(shader);return null;}
const vertexShader=loadShader(gl,gl.VERTEX_SHADER,vertexShaderSource);const fragmentShader=loadShader(gl,gl.FRAGMENT_SHADER,fragmentShaderSource);const shaderProgram=gl.createProgram();gl.attachShader(shaderProgram,vertexShader);gl.attachShader(shaderProgram,fragmentShader);gl.linkProgram(shaderProgram);if(gl.getProgramParameter(shaderProgram,gl.LINK_STATUS)){this._shaderProgram=shaderProgram;gl.useProgram(shaderProgram);}else{console.error('Unable to initialize the shader program: '+gl.getProgramInfoLog(shaderProgram));this._shaderProgram=null;}
this._vertexBuffer=gl.createBuffer();this._colorBuffer=gl.createBuffer();this._uScalingFactor=gl.getUniformLocation(shaderProgram,'uScalingFactor');this._uShiftVector=gl.getUniformLocation(shaderProgram,'uShiftVector');const uSampler=gl.getUniformLocation(shaderProgram,'uSampler');gl.uniform1i(uSampler,0);this._aVertexPosition=gl.getAttribLocation(this._shaderProgram,'aVertexPosition');this._aVertexColor=gl.getAttribLocation(this._shaderProgram,'aVertexColor');gl.enableVertexAttribArray(this._aVertexPosition);gl.enableVertexAttribArray(this._aVertexColor);}
_setupGLGeometry(){const gl=(this._canvasGL.getContext('webgl'));if(!gl)
return;const timelineData=this._timelineData();if(!timelineData)
return;const entryTotalTimes=timelineData.entryTotalTimes;const entryStartTimes=timelineData.entryStartTimes;const entryLevels=timelineData.entryLevels;const verticesPerBar=6;const vertexArray=new Float32Array(entryTotalTimes.length*verticesPerBar*2);let colorArray=new Uint8Array(entryTotalTimes.length*verticesPerBar);let vertex=0;const parsedColorCache=new Map();const colors=[];const collapsedOverviewLevels=new Array(this._visibleLevels.length);const groups=this._rawTimelineData.groups||[];this._forEachGroup((offset,index,group)=>{if(group.style.useFirstLineForOverview||!this._isGroupCollapsible(index)||group.expanded)
return;let nextGroup=index+1;while(nextGroup<groups.length&&groups[nextGroup].style.nestingLevel>group.style.nestingLevel)
++nextGroup;const endLevel=nextGroup<groups.length?groups[nextGroup].startLevel:this._dataProvider.maxStackDepth();for(let i=group.startLevel;i<endLevel;++i)
collapsedOverviewLevels[i]=offset;});for(let i=0;i<entryTotalTimes.length;++i){const level=entryLevels[i];const collapsedGroupOffset=collapsedOverviewLevels[level];if(!this._visibleLevels[level]&&!collapsedGroupOffset)
continue;const color=this._entryColorsCache[i];if(!color)
continue;let colorIndex=parsedColorCache.get(color);if(colorIndex===undefined){const rgba=Common.Color.parse(color).canonicalRGBA();rgba[3]=Math.round(rgba[3]*255);colorIndex=colors.length/4;colors.push(...rgba);if(colorIndex===256)
colorArray=new Uint16Array(colorArray);parsedColorCache.set(color,colorIndex);}
for(let j=0;j<verticesPerBar;++j)
colorArray[vertex+j]=colorIndex;const vpos=vertex*2;const x0=entryStartTimes[i]-this._minimumBoundary;const x1=x0+entryTotalTimes[i];const y0=collapsedGroupOffset||this._levelToOffset(level);const y1=y0+this._levelHeight(level)-1;vertexArray[vpos+0]=x0;vertexArray[vpos+1]=y0;vertexArray[vpos+2]=x1;vertexArray[vpos+3]=y0;vertexArray[vpos+4]=x0;vertexArray[vpos+5]=y1;vertexArray[vpos+6]=x0;vertexArray[vpos+7]=y1;vertexArray[vpos+8]=x1;vertexArray[vpos+9]=y0;vertexArray[vpos+10]=x1;vertexArray[vpos+11]=y1;vertex+=verticesPerBar;}
this._vertexCount=vertex;const paletteTexture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,paletteTexture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);gl.activeTexture(gl.TEXTURE0);const numColors=colors.length/4;const useShortForColors=numColors>=256;const width=!useShortForColors?256:Math.min(1<<16,gl.getParameter(gl.MAX_TEXTURE_SIZE));console.assert(numColors<=width,'Too many colors');const height=1;const colorIndexType=useShortForColors?gl.UNSIGNED_SHORT:gl.UNSIGNED_BYTE;if(useShortForColors){const factor=(1<<16)/width;for(let i=0;i<vertex;++i)
colorArray[i]*=factor;}
const pixels=new Uint8Array(width*4);pixels.set(colors);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,pixels);gl.bindBuffer(gl.ARRAY_BUFFER,this._vertexBuffer);gl.bufferData(gl.ARRAY_BUFFER,vertexArray,gl.STATIC_DRAW);gl.vertexAttribPointer(this._aVertexPosition,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ARRAY_BUFFER,this._colorBuffer);gl.bufferData(gl.ARRAY_BUFFER,colorArray,gl.STATIC_DRAW);gl.vertexAttribPointer(this._aVertexColor,1,colorIndexType,true,0,0);}
_drawGL(){const gl=(this._canvasGL.getContext('webgl'));if(!gl)
return;const timelineData=this._timelineData();if(!timelineData)
return;if(!this._prevTimelineData||timelineData.entryTotalTimes!==this._prevTimelineData.entryTotalTimes){this._prevTimelineData=timelineData;this._setupGLGeometry();}
gl.viewport(0,0,this._canvasGL.width,this._canvasGL.height);if(!this._vertexCount)
return;const viewportScale=[2.0/this.boundarySpan(),-2.0*window.devicePixelRatio/this._canvasGL.height];const viewportShift=[this.minimumBoundary()-this.zeroTime(),this._chartViewport.scrollOffset()];gl.uniform2fv(this._uScalingFactor,viewportScale);gl.uniform2fv(this._uShiftVector,viewportShift);gl.drawArrays(gl.TRIANGLES,0,this._vertexCount);}
_drawGroupHeaders(width,height){const context=(this._canvas.getContext('2d'));const top=this._chartViewport.scrollOffset();const ratio=window.devicePixelRatio;const groups=this._rawTimelineData.groups||[];if(!groups.length)
return;const groupOffsets=this._groupOffsets;const lastGroupOffset=Array.prototype.peekLast.call(groupOffsets);const colorUsage=UI.ThemeSupport.ColorUsage;context.save();context.scale(ratio,ratio);context.translate(0,-top);const defaultFont='11px '+Host.fontFamily();context.font=defaultFont;context.fillStyle=UI.themeSupport.patchColorText('#fff',colorUsage.Background);this._forEachGroupInViewport((offset,index,group)=>{const paddingHeight=group.style.padding;if(paddingHeight<5)
return;context.fillRect(0,offset-paddingHeight+2,width,paddingHeight-4);});if(groups.length&&lastGroupOffset<top+height)
context.fillRect(0,lastGroupOffset+2,width,top+height-lastGroupOffset);context.strokeStyle=UI.themeSupport.patchColorText('#eee',colorUsage.Background);context.beginPath();this._forEachGroupInViewport((offset,index,group,isFirst)=>{if(isFirst||group.style.padding<4)
return;hLine(offset-2.5);});hLine(lastGroupOffset+1.5);context.stroke();this._forEachGroupInViewport((offset,index,group)=>{if(group.style.useFirstLineForOverview)
return;if(!this._isGroupCollapsible(index)||group.expanded){if(!group.style.shareHeaderLine&&index!==this._selectedGroup){context.fillStyle=group.style.backgroundColor;context.fillRect(0,offset,width,group.style.height);}
return;}
if(this._useWebGL)
return;let nextGroup=index+1;while(nextGroup<groups.length&&groups[nextGroup].style.nestingLevel>group.style.nestingLevel)
nextGroup++;const endLevel=nextGroup<groups.length?groups[nextGroup].startLevel:this._dataProvider.maxStackDepth();this._drawCollapsedOverviewForGroup(group,offset,endLevel);});context.save();this._forEachGroupInViewport((offset,index,group)=>{context.font=group.style.font;if(this._isGroupCollapsible(index)&&!group.expanded||group.style.shareHeaderLine){const width=this._labelWidthForGroup(context,group)+2;if(index===this._selectedGroup)
context.fillStyle=this._selectedGroupBackroundColor;else
context.fillStyle=Common.Color.parse(group.style.backgroundColor).setAlpha(0.8).asString(null);context.fillRect(this._headerLeftPadding-this._headerLabelXPadding,offset+this._headerLabelYPadding,width,group.style.height-2*this._headerLabelYPadding);}
context.fillStyle=group.style.color;context.fillText(group.name,Math.floor(this._expansionArrowIndent*(group.style.nestingLevel+1)+this._arrowSide),offset+group.style.height-this._textBaseline);});context.restore();context.fillStyle=UI.themeSupport.patchColorText('#6e6e6e',colorUsage.Foreground);context.beginPath();this._forEachGroupInViewport((offset,index,group)=>{if(this._isGroupCollapsible(index)){drawExpansionArrow.call(this,this._expansionArrowIndent*(group.style.nestingLevel+1),offset+group.style.height-this._textBaseline-this._arrowSide/2,!!group.expanded);}});context.fill();context.strokeStyle=UI.themeSupport.patchColorText('#ddd',colorUsage.Background);context.beginPath();context.stroke();this._forEachGroupInViewport((offset,index,group,isFirst,groupHeight)=>{if(index===this._selectedGroup){const lineWidth=2;const bracketLength=10;context.fillStyle=this._selectedGroupBorderColor;context.fillRect(0,offset-lineWidth,lineWidth,groupHeight-group.style.padding+2*lineWidth);context.fillRect(0,offset-lineWidth,bracketLength,lineWidth);context.fillRect(0,offset+groupHeight-group.style.padding,bracketLength,lineWidth);}});context.restore();function hLine(y){context.moveTo(0,y);context.lineTo(width,y);}
function drawExpansionArrow(x,y,expanded){const arrowHeight=this._arrowSide*Math.sqrt(3)/2;const arrowCenterOffset=Math.round(arrowHeight/2);context.save();context.translate(x,y);context.rotate(expanded?Math.PI/2:0);context.moveTo(-arrowCenterOffset,-this._arrowSide/2);context.lineTo(-arrowCenterOffset,this._arrowSide/2);context.lineTo(arrowHeight-arrowCenterOffset,0);context.restore();}}
_forEachGroup(callback){const groups=this._rawTimelineData.groups||[];if(!groups.length)
return;const groupOffsets=this._groupOffsets;const groupStack=[{nestingLevel:-1,visible:true}];for(let i=0;i<groups.length;++i){const groupTop=groupOffsets[i];const group=groups[i];let firstGroup=true;while(groupStack.peekLast().nestingLevel>=group.style.nestingLevel){groupStack.pop();firstGroup=false;}
const parentGroupVisible=groupStack.peekLast().visible;const thisGroupVisible=parentGroupVisible&&(!this._isGroupCollapsible(i)||group.expanded);groupStack.push({nestingLevel:group.style.nestingLevel,visible:thisGroupVisible});const nextOffset=i===groups.length-1?groupOffsets[i+1]+group.style.padding:groupOffsets[i+1];if(!parentGroupVisible)
continue;callback(groupTop,i,group,firstGroup,nextOffset-groupTop);}}
_forEachGroupInViewport(callback){const top=this._chartViewport.scrollOffset();this._forEachGroup((groupTop,index,group,firstGroup,height)=>{if(groupTop-group.style.padding>top+this._offsetHeight)
return;if(groupTop+height<top)
return;callback(groupTop,index,group,firstGroup,height);});}
_labelWidthForGroup(context,group){return UI.measureTextWidth(context,group.name)+this._expansionArrowIndent*(group.style.nestingLevel+1)+
2*this._headerLabelXPadding;}
_drawCollapsedOverviewForGroup(group,y,endLevel){const range=new Common.SegmentedRange(mergeCallback);const timeWindowLeft=this._chartViewport.windowLeftTime();const timeWindowRight=this._chartViewport.windowRightTime();const context=(this._canvas.getContext('2d'));const barHeight=group.style.height;const entryStartTimes=this._rawTimelineData.entryStartTimes;const entryTotalTimes=this._rawTimelineData.entryTotalTimes;const timeToPixel=this._chartViewport.timeToPixel();for(let level=group.startLevel;level<endLevel;++level){const levelIndexes=this._timelineLevels[level];const rightIndexOnLevel=levelIndexes.lowerBound(timeWindowRight,(time,entryIndex)=>time-entryStartTimes[entryIndex])-1;let lastDrawOffset=Infinity;for(let entryIndexOnLevel=rightIndexOnLevel;entryIndexOnLevel>=0;--entryIndexOnLevel){const entryIndex=levelIndexes[entryIndexOnLevel];const entryStartTime=entryStartTimes[entryIndex];const barX=this._timeToPositionClipped(entryStartTime);const entryEndTime=entryStartTime+entryTotalTimes[entryIndex];if(isNaN(entryEndTime)||barX>=lastDrawOffset)
continue;if(entryEndTime<=timeWindowLeft)
break;lastDrawOffset=barX;const color=this._entryColorsCache[entryIndex];const endBarX=this._timeToPositionClipped(entryEndTime);if(group.style.useDecoratorsForOverview&&this._dataProvider.forceDecoration(entryIndex)){const unclippedBarX=this._chartViewport.timeToPosition(entryStartTime);const barWidth=endBarX-barX;context.beginPath();context.fillStyle=color;context.fillRect(barX,y,barWidth,barHeight-1);this._dataProvider.decorateEntry(entryIndex,context,'',barX,y,barWidth,barHeight,unclippedBarX,timeToPixel);continue;}
range.append(new Common.Segment(barX,endBarX,color));}}
const segments=range.segments().slice().sort((a,b)=>a.data.localeCompare(b.data));let lastColor;context.beginPath();for(let i=0;i<segments.length;++i){const segment=segments[i];if(lastColor!==segments[i].data){context.fill();context.beginPath();lastColor=segments[i].data;context.fillStyle=lastColor;}
context.rect(segment.begin,y,segment.end-segment.begin,barHeight);}
context.fill();function mergeCallback(a,b){return a.data===b.data&&a.end+0.4>b.end?a:null;}}
_drawFlowEvents(context,width,height){context.save();const ratio=window.devicePixelRatio;const top=this._chartViewport.scrollOffset();const arrowWidth=6;context.scale(ratio,ratio);context.translate(0,-top);context.fillStyle='#7f5050';context.strokeStyle='#7f5050';const td=this._timelineData();const endIndex=td.flowStartTimes.lowerBound(this._chartViewport.windowRightTime());context.lineWidth=0.5;for(let i=0;i<endIndex;++i){if(!td.flowEndTimes[i]||td.flowEndTimes[i]<this._chartViewport.windowLeftTime())
continue;const startX=this._chartViewport.timeToPosition(td.flowStartTimes[i]);const endX=this._chartViewport.timeToPosition(td.flowEndTimes[i]);const startLevel=td.flowStartLevels[i];const endLevel=td.flowEndLevels[i];const startY=this._levelToOffset(startLevel)+this._levelHeight(startLevel)/2;const endY=this._levelToOffset(endLevel)+this._levelHeight(endLevel)/2;const segment=Math.min((endX-startX)/4,40);const distanceTime=td.flowEndTimes[i]-td.flowStartTimes[i];const distanceY=(endY-startY)/10;const spread=30;const lineY=distanceTime<1?startY:spread+Math.max(0,startY+distanceY*(i%spread));const p=[];p.push({x:startX,y:startY});p.push({x:startX+arrowWidth,y:startY});p.push({x:startX+segment+2*arrowWidth,y:startY});p.push({x:startX+segment,y:lineY});p.push({x:startX+segment*2,y:lineY});p.push({x:endX-segment*2,y:lineY});p.push({x:endX-segment,y:lineY});p.push({x:endX-segment-2*arrowWidth,y:endY});p.push({x:endX-arrowWidth,y:endY});context.beginPath();context.moveTo(p[0].x,p[0].y);context.lineTo(p[1].x,p[1].y);context.bezierCurveTo(p[2].x,p[2].y,p[3].x,p[3].y,p[4].x,p[4].y);context.lineTo(p[5].x,p[5].y);context.bezierCurveTo(p[6].x,p[6].y,p[7].x,p[7].y,p[8].x,p[8].y);context.stroke();context.beginPath();context.arc(startX,startY,2,-Math.PI/2,Math.PI/2,false);context.fill();context.beginPath();context.moveTo(endX,endY);context.lineTo(endX-arrowWidth,endY-3);context.lineTo(endX-arrowWidth,endY+3);context.fill();}
context.restore();}
_drawMarkers(){const markers=this._timelineData().markers;const left=this._markerIndexBeforeTime(this.minimumBoundary());const rightBoundary=this.maximumBoundary();const timeToPixel=this._chartViewport.timeToPixel();const context=(this._canvas.getContext('2d'));context.save();const ratio=window.devicePixelRatio;context.scale(ratio,ratio);context.translate(0,3);const height=PerfUI.FlameChart.HeaderHeight-1;for(let i=left;i<markers.length;i++){const timestamp=markers[i].startTime();if(timestamp>rightBoundary)
break;markers[i].draw(context,this._chartViewport.timeToPosition(timestamp),height,timeToPixel);}
context.restore();}
_updateMarkerHighlight(){const element=this._markerHighlighElement;if(element.parentElement)
element.remove();const markerIndex=this._highlightedMarkerIndex;if(markerIndex===-1)
return;const marker=this._timelineData().markers[markerIndex];const barX=this._timeToPositionClipped(marker.startTime());element.title=marker.title();const style=element.style;style.left=barX+'px';style.backgroundColor=marker.color();this._viewportElement.appendChild(element);}
_processTimelineData(timelineData){if(!timelineData){this._timelineLevels=null;this._visibleLevelOffsets=null;this._visibleLevels=null;this._groupOffsets=null;this._rawTimelineData=null;this._forceDecorationCache=null;this._entryColorsCache=null;this._rawTimelineDataLength=0;this._selectedGroup=-1;this._flameChartDelegate.updateSelectedGroup(this,null);return;}
this._rawTimelineData=timelineData;this._rawTimelineDataLength=timelineData.entryStartTimes.length;this._forceDecorationCache=new Int8Array(this._rawTimelineDataLength);this._entryColorsCache=new Array(this._rawTimelineDataLength);for(let i=0;i<this._rawTimelineDataLength;++i){this._forceDecorationCache[i]=this._dataProvider.forceDecoration(i)?1:0;this._entryColorsCache[i]=this._dataProvider.entryColor(i);}
const entryCounters=new Uint32Array(this._dataProvider.maxStackDepth()+1);for(let i=0;i<timelineData.entryLevels.length;++i)
++entryCounters[timelineData.entryLevels[i]];const levelIndexes=new Array(entryCounters.length);for(let i=0;i<levelIndexes.length;++i){levelIndexes[i]=new Uint32Array(entryCounters[i]);entryCounters[i]=0;}
for(let i=0;i<timelineData.entryLevels.length;++i){const level=timelineData.entryLevels[i];levelIndexes[level][entryCounters[level]++]=i;}
this._timelineLevels=levelIndexes;const groups=this._rawTimelineData.groups||[];for(let i=0;i<groups.length;++i){const expanded=this._groupExpansionState[groups[i].name];if(expanded!==undefined)
groups[i].expanded=expanded;}
this._updateLevelPositions();this._updateHeight();this._selectedGroup=timelineData.selectedGroup?groups.indexOf(timelineData.selectedGroup):-1;this._flameChartDelegate.updateSelectedGroup(this,timelineData.selectedGroup);}
_updateLevelPositions(){const levelCount=this._dataProvider.maxStackDepth();const groups=this._rawTimelineData.groups||[];this._visibleLevelOffsets=new Uint32Array(levelCount+1);this._visibleLevelHeights=new Uint32Array(levelCount);this._visibleLevels=new Uint16Array(levelCount);this._groupOffsets=new Uint32Array(groups.length+1);let groupIndex=-1;let currentOffset=this._rulerEnabled?PerfUI.FlameChart.HeaderHeight+2:2;let visible=true;const groupStack=[{nestingLevel:-1,visible:true}];const lastGroupLevel=Math.max(levelCount,groups.length?groups.peekLast().startLevel+1:0);let level;for(level=0;level<lastGroupLevel;++level){let parentGroupIsVisible=true;let style;while(groupIndex<groups.length-1&&level===groups[groupIndex+1].startLevel){++groupIndex;style=groups[groupIndex].style;let nextLevel=true;while(groupStack.peekLast().nestingLevel>=style.nestingLevel){groupStack.pop();nextLevel=false;}
const thisGroupIsVisible=groupIndex>=0&&this._isGroupCollapsible(groupIndex)?groups[groupIndex].expanded:true;parentGroupIsVisible=groupStack.peekLast().visible;visible=thisGroupIsVisible&&parentGroupIsVisible;groupStack.push({nestingLevel:style.nestingLevel,visible:visible});if(parentGroupIsVisible)
currentOffset+=nextLevel?0:style.padding;this._groupOffsets[groupIndex]=currentOffset;if(parentGroupIsVisible&&!style.shareHeaderLine)
currentOffset+=style.height;}
const isFirstOnLevel=groupIndex>=0&&level===groups[groupIndex].startLevel;const thisLevelIsVisible=parentGroupIsVisible&&(visible||isFirstOnLevel&&groups[groupIndex].style.useFirstLineForOverview);if(level<levelCount){let height;if(groupIndex>=0){const group=groups[groupIndex];const styleB=group.style;height=isFirstOnLevel&&!styleB.shareHeaderLine||(styleB.collapsible&&!group.expanded)?styleB.height:(styleB.itemsHeight||this._barHeight);}else{height=this._barHeight;}
this._visibleLevels[level]=thisLevelIsVisible;this._visibleLevelOffsets[level]=currentOffset;this._visibleLevelHeights[level]=height;}
if(thisLevelIsVisible||(parentGroupIsVisible&&style&&style.shareHeaderLine&&isFirstOnLevel))
currentOffset+=this._visibleLevelHeights[level];}
if(groupIndex>=0)
this._groupOffsets[groupIndex+1]=currentOffset;this._visibleLevelOffsets[level]=currentOffset;if(this._useWebGL)
this._setupGLGeometry();}
_isGroupCollapsible(index){const groups=this._rawTimelineData.groups||[];const style=groups[index].style;if(!style.shareHeaderLine||!style.collapsible)
return!!style.collapsible;const isLastGroup=index+1>=groups.length;if(!isLastGroup&&groups[index+1].style.nestingLevel>style.nestingLevel)
return true;const nextGroupLevel=isLastGroup?this._dataProvider.maxStackDepth():groups[index+1].startLevel;if(nextGroupLevel!==groups[index].startLevel+1)
return true;return style.height!==style.itemsHeight;}
setSelectedEntry(entryIndex){if(this._selectedEntryIndex===entryIndex)
return;if(entryIndex!==-1)
this._chartViewport.hideRangeSelection();this._selectedEntryIndex=entryIndex;this._revealEntry(entryIndex);this._updateElementPosition(this._selectedElement,this._selectedEntryIndex);}
_updateElementPosition(element,entryIndex){const elementMinWidthPx=2;element.classList.add('hidden');if(entryIndex===-1)
return;const timelineData=this._timelineData();const startTime=timelineData.entryStartTimes[entryIndex];const duration=timelineData.entryTotalTimes[entryIndex];let barX=0;let barWidth=0;let visible=true;if(Number.isNaN(duration)){const position=this._markerPositions.get(entryIndex);if(position){barX=position.x;barWidth=position.width;}else{visible=false;}}else{barX=this._chartViewport.timeToPosition(startTime);barWidth=duration*this._chartViewport.timeToPixel();}
if(barX+barWidth<=0||barX>=this._offsetWidth)
return;const barCenter=barX+barWidth/2;barWidth=Math.max(barWidth,elementMinWidthPx);barX=barCenter-barWidth/2;const entryLevel=timelineData.entryLevels[entryIndex];const barY=this._levelToOffset(entryLevel)-this._chartViewport.scrollOffset();const barHeight=this._levelHeight(entryLevel);const style=element.style;style.left=barX+'px';style.top=barY+'px';style.width=barWidth+'px';style.height=barHeight-1+'px';element.classList.toggle('hidden',!visible);this._viewportElement.appendChild(element);}
_timeToPositionClipped(time){return Number.constrain(this._chartViewport.timeToPosition(time),0,this._offsetWidth);}
_levelToOffset(level){return this._visibleLevelOffsets[level];}
_levelHeight(level){return this._visibleLevelHeights[level];}
_updateBoundaries(){this._totalTime=this._dataProvider.totalTime();this._minimumBoundary=this._dataProvider.minimumBoundary();this._chartViewport.setBoundaries(this._minimumBoundary,this._totalTime);}
_updateHeight(){const height=this._levelToOffset(this._dataProvider.maxStackDepth())+2;this._chartViewport.setContentHeight(height);}
onResize(){this.scheduleUpdate();}
update(){if(!this._timelineData())
return;this._resetCanvas();this._updateHeight();this._updateBoundaries();this._draw();if(!this._chartViewport.isDragging())
this._updateHighlight();}
reset(){this._chartViewport.reset();this._rawTimelineData=null;this._rawTimelineDataLength=0;this._highlightedMarkerIndex=-1;this._highlightedEntryIndex=-1;this._selectedEntryIndex=-1;this._textWidth=new Map();this._chartViewport.scheduleUpdate();}
scheduleUpdate(){this._chartViewport.scheduleUpdate();}
_enabled(){return this._rawTimelineDataLength!==0;}
computePosition(time){return this._chartViewport.timeToPosition(time);}
formatValue(value,precision){return this._dataProvider.formatValue(value-this.zeroTime(),precision);}
maximumBoundary(){return this._chartViewport.windowRightTime();}
minimumBoundary(){return this._chartViewport.windowLeftTime();}
zeroTime(){return this._dataProvider.minimumBoundary();}
boundarySpan(){return this.maximumBoundary()-this.minimumBoundary();}};PerfUI.FlameChart.HeaderHeight=15;PerfUI.FlameChart.MinimalTimeWindowMs=0.5;PerfUI.FlameChartDataProvider=function(){};PerfUI.FlameChart.Group;PerfUI.FlameChart.GroupStyle;PerfUI.FlameChart.TimelineData=class{constructor(entryLevels,entryTotalTimes,entryStartTimes,groups){this.entryLevels=entryLevels;this.entryTotalTimes=entryTotalTimes;this.entryStartTimes=entryStartTimes;this.groups=groups;this.markers=[];this.flowStartTimes=[];this.flowStartLevels=[];this.flowEndTimes=[];this.flowEndLevels=[];this.selectedGroup=null;}};PerfUI.FlameChartDataProvider.prototype={minimumBoundary(){},totalTime(){},formatValue(value,precision){},maxStackDepth(){},timelineData(){},prepareHighlightedEntryInfo(entryIndex){},canJumpToEntry(entryIndex){},entryTitle(entryIndex){},entryFont(entryIndex){},entryColor(entryIndex){},decorateEntry(entryIndex,context,text,barX,barY,barWidth,barHeight,unclippedBarX,timeToPixelRatio){},forceDecoration(entryIndex){},textColor(entryIndex){},};PerfUI.FlameChartMarker=function(){};PerfUI.FlameChartMarker.prototype={startTime(){},color(){},title(){},draw(context,x,height,pixelsPerMillisecond){},};PerfUI.FlameChart.Events={EntrySelected:Symbol('EntrySelected'),EntryHighlighted:Symbol('EntryHighlighted')};PerfUI.FlameChart.Colors={SelectedGroupBackground:'hsl(215, 85%, 98%)',SelectedGroupBorder:'hsl(216, 68%, 54%)',};;PerfUI.GCActionDelegate=class{handleAction(context,actionId){for(const heapProfilerModel of SDK.targetManager.models(SDK.HeapProfilerModel))
heapProfilerModel.collectGarbage();return true;}};;PerfUI.LineLevelProfile={};PerfUI.LineLevelProfile.Performance=class{constructor(){this._helper=new PerfUI.LineLevelProfile._Helper('performance');}
reset(){this._helper.reset();}
_appendLegacyCPUProfile(profile){const target=profile.target();const nodesToGo=[profile.profileHead];const sampleDuration=(profile.profileEndTime-profile.profileStartTime)/profile.totalHitCount;while(nodesToGo.length){const nodes=nodesToGo.pop().children;for(let i=0;i<nodes.length;++i){const node=nodes[i];nodesToGo.push(node);if(!node.url||!node.positionTicks)
continue;for(let j=0;j<node.positionTicks.length;++j){const lineInfo=node.positionTicks[j];const line=lineInfo.line;const time=lineInfo.ticks*sampleDuration;this._helper.addLineData(target,node.url,line,time);}}}}
appendCPUProfile(profile){if(!profile.lines){this._appendLegacyCPUProfile(profile);this._helper.scheduleUpdate();return;}
const target=profile.target();for(let i=1;i<profile.samples.length;++i){const line=profile.lines[i];if(!line)
continue;const node=profile.nodeByIndex(i);const scriptIdOrUrl=node.scriptId||node.url;if(!scriptIdOrUrl)
continue;const time=profile.timestamps[i]-profile.timestamps[i-1];this._helper.addLineData(target,scriptIdOrUrl,line,time);}
this._helper.scheduleUpdate();}};PerfUI.LineLevelProfile.Memory=class{constructor(){this._helper=new PerfUI.LineLevelProfile._Helper('memory');}
reset(){this._helper.reset();}
appendHeapProfile(profile,target){const helper=this._helper;processNode(profile.head);helper.scheduleUpdate();function processNode(node){node.children.forEach(processNode);if(!node.selfSize)
return;const script=Number(node.callFrame.scriptId)||node.callFrame.url;if(!script)
return;const line=node.callFrame.lineNumber+1;helper.addLineData(target,script,line,node.selfSize);}}};PerfUI.LineLevelProfile._Helper=class{constructor(type){this._type=type;this._locationPool=new Bindings.LiveLocationPool();this._updateTimer=null;this.reset();}
reset(){this._lineData=new Map();this.scheduleUpdate();}
addLineData(target,scriptIdOrUrl,line,data){let targetData=this._lineData.get(target);if(!targetData){targetData=new Map();this._lineData.set(target,targetData);}
let scriptData=targetData.get(scriptIdOrUrl);if(!scriptData){scriptData=new Map();targetData.set(scriptIdOrUrl,scriptData);}
scriptData.set(line,(scriptData.get(line)||0)+data);}
scheduleUpdate(){if(this._updateTimer)
return;this._updateTimer=setTimeout(()=>{this._updateTimer=null;this._doUpdate();},0);}
_doUpdate(){this._locationPool.disposeAll();Workspace.workspace.uiSourceCodes().forEach(uiSourceCode=>uiSourceCode.removeDecorationsForType(this._type));for(const targetToScript of this._lineData){const target=(targetToScript[0]);const debuggerModel=target?target.model(SDK.DebuggerModel):null;const scriptToLineMap=(targetToScript[1]);for(const scriptToLine of scriptToLineMap){const scriptIdOrUrl=(scriptToLine[0]);const lineToDataMap=(scriptToLine[1]);const uiSourceCode=!debuggerModel&&typeof scriptIdOrUrl==='string'?Workspace.workspace.uiSourceCodeForURL(scriptIdOrUrl):null;if(!debuggerModel&&!uiSourceCode)
continue;for(const lineToData of lineToDataMap){const line=(lineToData[0])-1;const data=(lineToData[1]);if(uiSourceCode){uiSourceCode.addLineDecoration(line,this._type,data);continue;}
const rawLocation=typeof scriptIdOrUrl==='string'?debuggerModel.createRawLocationByURL(scriptIdOrUrl,line,0):debuggerModel.createRawLocationByScriptId(String(scriptIdOrUrl),line,0);if(rawLocation)
new PerfUI.LineLevelProfile.Presentation(rawLocation,this._type,data,this._locationPool);}}}}};PerfUI.LineLevelProfile.Presentation=class{constructor(rawLocation,type,time,locationPool){this._type=type;this._time=time;this._uiLocation=null;Bindings.debuggerWorkspaceBinding.createLiveLocation(rawLocation,this.updateLocation.bind(this),locationPool);}
updateLocation(liveLocation){if(this._uiLocation)
this._uiLocation.uiSourceCode.removeDecorationsForType(this._type);this._uiLocation=liveLocation.uiLocation();if(this._uiLocation)
this._uiLocation.uiSourceCode.addLineDecoration(this._uiLocation.lineNumber,this._type,this._time);}};PerfUI.LineLevelProfile.LineDecorator=class{decorate(uiSourceCode,textEditor,type){const gutterType=`CodeMirror-gutter-${type}`;const decorations=uiSourceCode.decorationsForType(type);textEditor.uninstallGutter(gutterType);if(!decorations||!decorations.size)
return;textEditor.installGutter(gutterType,false);for(const decoration of decorations){const value=(decoration.data());const element=this._createElement(type,value);textEditor.setGutterDecoration(decoration.range().startLine,gutterType,element);}}
_createElement(type,value){const element=createElementWithClass('div','text-editor-line-marker-text');if(type==='performance'){const intensity=Number.constrain(Math.log10(1+10*value)/5,0.02,1);element.textContent=Common.UIString('%.1f',value);element.style.backgroundColor=`hsla(44, 100%, 50%, ${intensity.toFixed(3)})`;element.createChild('span','line-marker-units').textContent=ls`ms`;}else{const intensity=Number.constrain(Math.log10(1+2e-3*value)/5,0.02,1);element.style.backgroundColor=`hsla(217, 100%, 70%, ${intensity.toFixed(3)})`;value/=1e3;let units;let fractionDigits;if(value>=1e3){units=ls`MB`;value/=1e3;fractionDigits=value>=20?0:1;}else{units=ls`KB`;fractionDigits=0;}
element.textContent=Common.UIString(`%.${fractionDigits}f`,value);element.createChild('span','line-marker-units').textContent=units;}
return element;}};;PerfUI.LiveHeapProfile=class{constructor(){this._running=false;this._sessionId=0;this._loadEventCallback=()=>{};this._setting=Common.settings.moduleSetting('memoryLiveHeapProfile');this._setting.addChangeListener(event=>event.data?this._startProfiling():this._stopProfiling());if(this._setting.get())
this._startProfiling();}
run(){}
modelAdded(model){model.startSampling(1e4);}
modelRemoved(model){}
async _startProfiling(){if(this._running)
return;this._running=true;const sessionId=this._sessionId;SDK.targetManager.observeModels(SDK.HeapProfilerModel,this);SDK.targetManager.addModelListener(SDK.ResourceTreeModel,SDK.ResourceTreeModel.Events.Load,this._loadEventFired,this);do{const models=SDK.targetManager.models(SDK.HeapProfilerModel);const profiles=await Promise.all(models.map(model=>model.getSamplingProfile()));if(sessionId!==this._sessionId)
break;const lineLevelProfile=self.runtime.sharedInstance(PerfUI.LineLevelProfile.Memory);lineLevelProfile.reset();for(let i=0;i<profiles.length;++i){if(profiles[i])
lineLevelProfile.appendHeapProfile(profiles[i],models[i].target());}
await Promise.race([new Promise(r=>setTimeout(r,Host.isUnderTest()?10:5000)),new Promise(r=>this._loadEventCallback=r)]);}while(sessionId===this._sessionId);SDK.targetManager.unobserveModels(SDK.HeapProfilerModel,this);SDK.targetManager.removeModelListener(SDK.ResourceTreeModel,SDK.ResourceTreeModel.Events.Load,this._loadEventFired,this);for(const model of SDK.targetManager.models(SDK.HeapProfilerModel))
model.stopSampling();self.runtime.sharedInstance(PerfUI.LineLevelProfile.Memory).reset();}
_stopProfiling(){if(!this._running)
return;this._running=0;this._sessionId++;}
_loadEventFired(){this._loadEventCallback();}};;PerfUI.uiLabelForNetworkPriority=function(priority){return PerfUI._priorityUILabelMap().get(priority)||'';};PerfUI.uiLabelToNetworkPriority=function(priorityLabel){if(!PerfUI._uiLabelToPriorityMapInstance){PerfUI._uiLabelToPriorityMapInstance=new Map();PerfUI._priorityUILabelMap().forEach((value,key)=>PerfUI._uiLabelToPriorityMapInstance.set(value,key));}
return PerfUI._uiLabelToPriorityMapInstance.get(priorityLabel)||'';};PerfUI._priorityUILabelMap=function(){if(PerfUI._priorityUILabelMapInstance)
return PerfUI._priorityUILabelMapInstance;const map=new Map();map.set(Protocol.Network.ResourcePriority.VeryLow,Common.UIString('Lowest'));map.set(Protocol.Network.ResourcePriority.Low,Common.UIString('Low'));map.set(Protocol.Network.ResourcePriority.Medium,Common.UIString('Medium'));map.set(Protocol.Network.ResourcePriority.High,Common.UIString('High'));map.set(Protocol.Network.ResourcePriority.VeryHigh,Common.UIString('Highest'));PerfUI._priorityUILabelMapInstance=map;return map;};PerfUI.networkPriorityWeight=function(priority){if(!PerfUI._networkPriorityWeights){const priorityMap=new Map();priorityMap.set(Protocol.Network.ResourcePriority.VeryLow,1);priorityMap.set(Protocol.Network.ResourcePriority.Low,2);priorityMap.set(Protocol.Network.ResourcePriority.Medium,3);priorityMap.set(Protocol.Network.ResourcePriority.High,4);priorityMap.set(Protocol.Network.ResourcePriority.VeryHigh,5);PerfUI._networkPriorityWeights=priorityMap;}
return PerfUI._networkPriorityWeights.get(priority)||0;};;PerfUI.OverviewGrid=class{constructor(prefix){this.element=createElement('div');this.element.id=prefix+'-overview-container';this._grid=new PerfUI.TimelineGrid();this._grid.element.id=prefix+'-overview-grid';this._grid.setScrollTop(0);this.element.appendChild(this._grid.element);this._window=new PerfUI.OverviewGrid.Window(this.element,this._grid.dividersLabelBarElement);}
clientWidth(){return this.element.clientWidth;}
updateDividers(calculator){this._grid.updateDividers(calculator);}
addEventDividers(dividers){this._grid.addEventDividers(dividers);}
removeEventDividers(){this._grid.removeEventDividers();}
reset(){this._window.reset();}
windowLeft(){return this._window.windowLeft;}
windowRight(){return this._window.windowRight;}
setWindow(left,right){this._window._setWindow(left,right);}
addEventListener(eventType,listener,thisObject){return this._window.addEventListener(eventType,listener,thisObject);}
setClickHandler(clickHandler){this._window.setClickHandler(clickHandler);}
zoom(zoomFactor,referencePoint){this._window._zoom(zoomFactor,referencePoint);}
setResizeEnabled(enabled){this._window.setEnabled(enabled);}};PerfUI.OverviewGrid.MinSelectableSize=14;PerfUI.OverviewGrid.WindowScrollSpeedFactor=.3;PerfUI.OverviewGrid.ResizerOffset=3.5;PerfUI.OverviewGrid.Window=class extends Common.Object{constructor(parentElement,dividersLabelBarElement){super();this._parentElement=parentElement;UI.installDragHandle(this._parentElement,this._startWindowSelectorDragging.bind(this),this._windowSelectorDragging.bind(this),this._endWindowSelectorDragging.bind(this),'text',null);if(dividersLabelBarElement){UI.installDragHandle(dividersLabelBarElement,this._startWindowDragging.bind(this),this._windowDragging.bind(this),null,'-webkit-grabbing','-webkit-grab');}
this._parentElement.addEventListener('mousewheel',this._onMouseWheel.bind(this),true);this._parentElement.addEventListener('dblclick',this._resizeWindowMaximum.bind(this),true);UI.appendStyle(this._parentElement,'perf_ui/overviewGrid.css');this._leftResizeElement=parentElement.createChild('div','overview-grid-window-resizer');UI.installDragHandle(this._leftResizeElement,this._resizerElementStartDragging.bind(this),this._leftResizeElementDragging.bind(this),null,'ew-resize');this._rightResizeElement=parentElement.createChild('div','overview-grid-window-resizer');UI.installDragHandle(this._rightResizeElement,this._resizerElementStartDragging.bind(this),this._rightResizeElementDragging.bind(this),null,'ew-resize');this._leftCurtainElement=parentElement.createChild('div','window-curtain-left');this._rightCurtainElement=parentElement.createChild('div','window-curtain-right');this.reset();}
reset(){this.windowLeft=0.0;this.windowRight=1.0;this.setEnabled(true);this._updateCurtains();}
setEnabled(enabled){this._enabled=enabled;}
setClickHandler(clickHandler){this._clickHandler=clickHandler;}
_resizerElementStartDragging(event){if(!this._enabled)
return false;this._resizerParentOffsetLeft=event.pageX-event.offsetX-event.target.offsetLeft;event.stopPropagation();return true;}
_leftResizeElementDragging(event){this._resizeWindowLeft(event.pageX-this._resizerParentOffsetLeft);event.preventDefault();}
_rightResizeElementDragging(event){this._resizeWindowRight(event.pageX-this._resizerParentOffsetLeft);event.preventDefault();}
_startWindowSelectorDragging(event){if(!this._enabled)
return false;this._offsetLeft=this._parentElement.totalOffsetLeft();const position=event.x-this._offsetLeft;this._overviewWindowSelector=new PerfUI.OverviewGrid.WindowSelector(this._parentElement,position);return true;}
_windowSelectorDragging(event){this._overviewWindowSelector._updatePosition(event.x-this._offsetLeft);event.preventDefault();}
_endWindowSelectorDragging(event){const window=this._overviewWindowSelector._close(event.x-this._offsetLeft);delete this._overviewWindowSelector;const clickThreshold=3;if(window.end-window.start<clickThreshold){if(this._clickHandler&&this._clickHandler.call(null,event))
return;const middle=window.end;window.start=Math.max(0,middle-PerfUI.OverviewGrid.MinSelectableSize/2);window.end=Math.min(this._parentElement.clientWidth,middle+PerfUI.OverviewGrid.MinSelectableSize/2);}else if(window.end-window.start<PerfUI.OverviewGrid.MinSelectableSize){if(this._parentElement.clientWidth-window.end>PerfUI.OverviewGrid.MinSelectableSize)
window.end=window.start+PerfUI.OverviewGrid.MinSelectableSize;else
window.start=window.end-PerfUI.OverviewGrid.MinSelectableSize;}
this._setWindowPosition(window.start,window.end);}
_startWindowDragging(event){this._dragStartPoint=event.pageX;this._dragStartLeft=this.windowLeft;this._dragStartRight=this.windowRight;event.stopPropagation();return true;}
_windowDragging(event){event.preventDefault();let delta=(event.pageX-this._dragStartPoint)/this._parentElement.clientWidth;if(this._dragStartLeft+delta<0)
delta=-this._dragStartLeft;if(this._dragStartRight+delta>1)
delta=1-this._dragStartRight;this._setWindow(this._dragStartLeft+delta,this._dragStartRight+delta);}
_resizeWindowLeft(start){if(start<10)
start=0;else if(start>this._rightResizeElement.offsetLeft-4)
start=this._rightResizeElement.offsetLeft-4;this._setWindowPosition(start,null);}
_resizeWindowRight(end){if(end>this._parentElement.clientWidth-10)
end=this._parentElement.clientWidth;else if(end<this._leftResizeElement.offsetLeft+PerfUI.OverviewGrid.MinSelectableSize)
end=this._leftResizeElement.offsetLeft+PerfUI.OverviewGrid.MinSelectableSize;this._setWindowPosition(null,end);}
_resizeWindowMaximum(){this._setWindowPosition(0,this._parentElement.clientWidth);}
_setWindow(windowLeft,windowRight){this.windowLeft=windowLeft;this.windowRight=windowRight;this._updateCurtains();this.dispatchEventToListeners(PerfUI.OverviewGrid.Events.WindowChanged);}
_updateCurtains(){let left=this.windowLeft;let right=this.windowRight;const width=right-left;const widthInPixels=width*this._parentElement.clientWidth;const minWidthInPixels=PerfUI.OverviewGrid.MinSelectableSize/2;if(widthInPixels<minWidthInPixels){const factor=minWidthInPixels/widthInPixels;left=((this.windowRight+this.windowLeft)-width*factor)/2;right=((this.windowRight+this.windowLeft)+width*factor)/2;}
this._leftResizeElement.style.left=(100*left).toFixed(2)+'%';this._rightResizeElement.style.left=(100*right).toFixed(2)+'%';this._leftCurtainElement.style.width=(100*left).toFixed(2)+'%';this._rightCurtainElement.style.width=(100*(1-right)).toFixed(2)+'%';}
_setWindowPosition(start,end){const clientWidth=this._parentElement.clientWidth;const windowLeft=typeof start==='number'?start/clientWidth:this.windowLeft;const windowRight=typeof end==='number'?end/clientWidth:this.windowRight;this._setWindow(windowLeft,windowRight);}
_onMouseWheel(event){if(!this._enabled)
return;if(typeof event.wheelDeltaY==='number'&&event.wheelDeltaY){const zoomFactor=1.1;const mouseWheelZoomSpeed=1/120;const reference=event.offsetX/event.target.clientWidth;this._zoom(Math.pow(zoomFactor,-event.wheelDeltaY*mouseWheelZoomSpeed),reference);}
if(typeof event.wheelDeltaX==='number'&&event.wheelDeltaX){let offset=Math.round(event.wheelDeltaX*PerfUI.OverviewGrid.WindowScrollSpeedFactor);const windowLeft=this._leftResizeElement.offsetLeft+PerfUI.OverviewGrid.ResizerOffset;const windowRight=this._rightResizeElement.offsetLeft+PerfUI.OverviewGrid.ResizerOffset;if(windowLeft-offset<0)
offset=windowLeft;if(windowRight-offset>this._parentElement.clientWidth)
offset=windowRight-this._parentElement.clientWidth;this._setWindowPosition(windowLeft-offset,windowRight-offset);event.preventDefault();}}
_zoom(factor,reference){let left=this.windowLeft;let right=this.windowRight;const windowSize=right-left;let newWindowSize=factor*windowSize;if(newWindowSize>1){newWindowSize=1;factor=newWindowSize/windowSize;}
left=reference+(left-reference)*factor;left=Number.constrain(left,0,1-newWindowSize);right=reference+(right-reference)*factor;right=Number.constrain(right,newWindowSize,1);this._setWindow(left,right);}};PerfUI.OverviewGrid.Events={WindowChanged:Symbol('WindowChanged')};PerfUI.OverviewGrid.WindowSelector=class{constructor(parent,position){this._startPosition=position;this._width=parent.offsetWidth;this._windowSelector=createElement('div');this._windowSelector.className='overview-grid-window-selector';this._windowSelector.style.left=this._startPosition+'px';this._windowSelector.style.right=this._width-this._startPosition+'px';parent.appendChild(this._windowSelector);}
_close(position){position=Math.max(0,Math.min(position,this._width));this._windowSelector.remove();return this._startPosition<position?{start:this._startPosition,end:position}:{start:position,end:this._startPosition};}
_updatePosition(position){position=Math.max(0,Math.min(position,this._width));if(position<this._startPosition){this._windowSelector.style.left=position+'px';this._windowSelector.style.right=this._width-this._startPosition+'px';}else{this._windowSelector.style.left=this._startPosition+'px';this._windowSelector.style.right=this._width-position+'px';}}};;PerfUI.PieChartOptions;PerfUI.PieChart=class{constructor(options){const{size,formatter,showLegend,chartName}=options;this.element=createElement('div');this._shadowRoot=UI.createShadowRootWithCoreStyles(this.element,'perf_ui/pieChart.css');const root=this._shadowRoot.createChild('div','root');UI.ARIAUtils.markAsGroup(root);UI.ARIAUtils.setAccessibleName(root,chartName);this._chartRoot=root.createChild('div','chart-root');const svg=this._createSVGChild(this._chartRoot,'svg');this._group=this._createSVGChild(svg,'g');this._innerR=0.618;const strokeWidth=1/size;let circle=this._createSVGChild(this._group,'circle');circle.setAttribute('r',1);circle.setAttribute('stroke','hsl(0, 0%, 80%)');circle.setAttribute('fill','transparent');circle.setAttribute('stroke-width',strokeWidth);circle=this._createSVGChild(this._group,'circle');circle.setAttribute('r',this._innerR);circle.setAttribute('stroke','hsl(0, 0%, 80%)');circle.setAttribute('fill','transparent');circle.setAttribute('stroke-width',strokeWidth);this._foregroundElement=this._chartRoot.createChild('div','pie-chart-foreground');this._totalElement=this._foregroundElement.createChild('div','pie-chart-total');this._formatter=formatter;this._slices=[];this._lastAngle=-Math.PI/2;if(showLegend)
this._legend=root.createChild('div','pie-chart-legend');this._setSize(size);}
setTotal(totalValue){for(let i=0;i<this._slices.length;++i)
this._slices[i].remove();this._slices=[];this._totalValue=totalValue;this._lastAngle=-Math.PI/2;let totalString;if(totalValue)
totalString=this._formatter?this._formatter(totalValue):totalValue;else
totalString='';this._totalElement.textContent=totalString;if(this._legend){this._legend.removeChildren();const legendItem=this._addLegendItem(totalValue,ls`Total`);UI.ARIAUtils.setLabelledBy(this._totalElement,legendItem);}}
_setSize(value){this._group.setAttribute('transform','scale('+(value/2)+') translate(1, 1) scale(0.99, 0.99)');const size=value+'px';this._chartRoot.style.width=size;this._chartRoot.style.height=size;}
addSlice(value,color,name){let sliceAngle=value/this._totalValue*2*Math.PI;if(!isFinite(sliceAngle))
return;sliceAngle=Math.min(sliceAngle,2*Math.PI*0.9999);const path=this._createSVGChild(this._group,'path');const x1=Math.cos(this._lastAngle);const y1=Math.sin(this._lastAngle);this._lastAngle+=sliceAngle;const x2=Math.cos(this._lastAngle);const y2=Math.sin(this._lastAngle);const r2=this._innerR;const x3=x2*r2;const y3=y2*r2;const x4=x1*r2;const y4=y1*r2;const largeArc=sliceAngle>Math.PI?1:0;path.setAttribute('d',`M${x1},${y1} A1,1,0,${largeArc},1,${x2},${y2} L${x3},${y3} A${r2},${r2},0,${largeArc},0,${x4},${y4} Z`);path.setAttribute('fill',color);this._slices.push(path);if(this._legend){const legendItem=this._addLegendItem(value,name,color);UI.ARIAUtils.setLabelledBy(path,legendItem);}}
_createSVGChild(parent,childType){const child=parent.ownerDocument.createElementNS('http://www.w3.org/2000/svg',childType);parent.appendChild(child);return child;}
_addLegendItem(value,name,color){const node=this._legend.ownerDocument.createElement('div');node.className='pie-chart-legend-row';if(this._legend.childElementCount)
this._legend.insertBefore(node,this._legend.lastElementChild);else
this._legend.appendChild(node);const sizeDiv=node.createChild('div','pie-chart-size');const swatchDiv=node.createChild('div','pie-chart-swatch');const nameDiv=node.createChild('div','pie-chart-name');if(color)
swatchDiv.style.backgroundColor=color;else
swatchDiv.classList.add('pie-chart-empty-swatch');nameDiv.textContent=name;sizeDiv.textContent=this._formatter?this._formatter(value):value;return node;}};;PerfUI.TimelineGrid=class{constructor(){this.element=createElement('div');UI.appendStyle(this.element,'perf_ui/timelineGrid.css');this._dividersElement=this.element.createChild('div','resources-dividers');this._gridHeaderElement=createElement('div');this._gridHeaderElement.classList.add('timeline-grid-header');this._eventDividersElement=this._gridHeaderElement.createChild('div','resources-event-dividers');this._dividersLabelBarElement=this._gridHeaderElement.createChild('div','resources-dividers-label-bar');this.element.appendChild(this._gridHeaderElement);}
static calculateGridOffsets(calculator,freeZoneAtLeft){const minGridSlicePx=64;const clientWidth=calculator.computePosition(calculator.maximumBoundary());let dividersCount=clientWidth/minGridSlicePx;let gridSliceTime=calculator.boundarySpan()/dividersCount;const pixelsPerTime=clientWidth/calculator.boundarySpan();const logGridSliceTime=Math.ceil(Math.log(gridSliceTime)/Math.LN10);gridSliceTime=Math.pow(10,logGridSliceTime);if(gridSliceTime*pixelsPerTime>=5*minGridSlicePx)
gridSliceTime=gridSliceTime/5;if(gridSliceTime*pixelsPerTime>=2*minGridSlicePx)
gridSliceTime=gridSliceTime/2;const firstDividerTime=Math.ceil((calculator.minimumBoundary()-calculator.zeroTime())/gridSliceTime)*gridSliceTime+
calculator.zeroTime();let lastDividerTime=calculator.maximumBoundary();lastDividerTime+=minGridSlicePx/pixelsPerTime;dividersCount=Math.ceil((lastDividerTime-firstDividerTime)/gridSliceTime);if(!gridSliceTime)
dividersCount=0;const offsets=[];for(let i=0;i<dividersCount;++i){const time=firstDividerTime+gridSliceTime*i;if(calculator.computePosition(time)<freeZoneAtLeft)
continue;offsets.push({position:Math.floor(calculator.computePosition(time)),time:time});}
return{offsets:offsets,precision:Math.max(0,-Math.floor(Math.log(gridSliceTime*1.01)/Math.LN10))};}
static drawCanvasGrid(context,dividersData){context.save();context.scale(window.devicePixelRatio,window.devicePixelRatio);const height=Math.floor(context.canvas.height/window.devicePixelRatio);context.strokeStyle=UI.themeSupport.patchColorText('rgba(0, 0, 0, 0.1)',UI.ThemeSupport.ColorUsage.Foreground);context.lineWidth=1;context.translate(0.5,0.5);context.beginPath();for(const offsetInfo of dividersData.offsets){context.moveTo(offsetInfo.position,0);context.lineTo(offsetInfo.position,height);}
context.stroke();context.restore();}
static drawCanvasHeaders(context,dividersData,formatTimeFunction,paddingTop,headerHeight,freeZoneAtLeft){context.save();context.scale(window.devicePixelRatio,window.devicePixelRatio);const width=Math.ceil(context.canvas.width/window.devicePixelRatio);context.beginPath();context.fillStyle=UI.themeSupport.patchColorText('rgba(255, 255, 255, 0.5)',UI.ThemeSupport.ColorUsage.Background);context.fillRect(0,0,width,headerHeight);context.fillStyle=UI.themeSupport.patchColorText('#333',UI.ThemeSupport.ColorUsage.Foreground);context.textBaseline='hanging';context.font='11px '+Host.fontFamily();const paddingRight=4;for(const offsetInfo of dividersData.offsets){const text=formatTimeFunction(offsetInfo.time);const textWidth=context.measureText(text).width;const textPosition=offsetInfo.position-textWidth-paddingRight;if(!freeZoneAtLeft||freeZoneAtLeft<textPosition)
context.fillText(text,textPosition,paddingTop);}
context.restore();}
get dividersElement(){return this._dividersElement;}
get dividersLabelBarElement(){return this._dividersLabelBarElement;}
removeDividers(){this._dividersElement.removeChildren();this._dividersLabelBarElement.removeChildren();}
updateDividers(calculator,freeZoneAtLeft){const dividersData=PerfUI.TimelineGrid.calculateGridOffsets(calculator,freeZoneAtLeft);const dividerOffsets=dividersData.offsets;const precision=dividersData.precision;const dividersElementClientWidth=this._dividersElement.clientWidth;let divider=(this._dividersElement.firstChild);let dividerLabelBar=(this._dividersLabelBarElement.firstChild);for(let i=0;i<dividerOffsets.length;++i){if(!divider){divider=createElement('div');divider.className='resources-divider';this._dividersElement.appendChild(divider);dividerLabelBar=createElement('div');dividerLabelBar.className='resources-divider';const label=createElement('div');label.className='resources-divider-label';dividerLabelBar._labelElement=label;dividerLabelBar.appendChild(label);this._dividersLabelBarElement.appendChild(dividerLabelBar);}
const time=dividerOffsets[i].time;const position=dividerOffsets[i].position;dividerLabelBar._labelElement.textContent=calculator.formatValue(time,precision);const percentLeft=100*position/dividersElementClientWidth;divider.style.left=percentLeft+'%';dividerLabelBar.style.left=percentLeft+'%';divider=(divider.nextSibling);dividerLabelBar=(dividerLabelBar.nextSibling);}
while(divider){const nextDivider=divider.nextSibling;this._dividersElement.removeChild(divider);divider=nextDivider;}
while(dividerLabelBar){const nextDivider=dividerLabelBar.nextSibling;this._dividersLabelBarElement.removeChild(dividerLabelBar);dividerLabelBar=nextDivider;}
return true;}
addEventDivider(divider){this._eventDividersElement.appendChild(divider);}
addEventDividers(dividers){this._gridHeaderElement.removeChild(this._eventDividersElement);for(const divider of dividers)
this._eventDividersElement.appendChild(divider);this._gridHeaderElement.appendChild(this._eventDividersElement);}
removeEventDividers(){this._eventDividersElement.removeChildren();}
hideEventDividers(){this._eventDividersElement.classList.add('hidden');}
showEventDividers(){this._eventDividersElement.classList.remove('hidden');}
hideDividers(){this._dividersElement.classList.add('hidden');}
showDividers(){this._dividersElement.classList.remove('hidden');}
setScrollTop(scrollTop){this._dividersLabelBarElement.style.top=scrollTop+'px';this._eventDividersElement.style.top=scrollTop+'px';}};PerfUI.TimelineGrid.DividersData;PerfUI.TimelineGrid.Calculator=function(){};PerfUI.TimelineGrid.Calculator.prototype={computePosition(time){},formatValue(time,precision){},minimumBoundary(){},zeroTime(){},maximumBoundary(){},boundarySpan(){}};;PerfUI.TimelineOverviewPane=class extends UI.VBox{constructor(prefix){super();this.element.id=prefix+'-overview-pane';this._overviewCalculator=new PerfUI.TimelineOverviewCalculator();this._overviewGrid=new PerfUI.OverviewGrid(prefix);this.element.appendChild(this._overviewGrid.element);this._cursorArea=this._overviewGrid.element.createChild('div','overview-grid-cursor-area');this._cursorElement=this._overviewGrid.element.createChild('div','overview-grid-cursor-position');this._cursorArea.addEventListener('mousemove',this._onMouseMove.bind(this),true);this._cursorArea.addEventListener('mouseleave',this._hideCursor.bind(this),true);this._overviewGrid.setResizeEnabled(false);this._overviewGrid.addEventListener(PerfUI.OverviewGrid.Events.WindowChanged,this._onWindowChanged,this);this._overviewGrid.setClickHandler(this._onClick.bind(this));this._overviewControls=[];this._markers=new Map();this._overviewInfo=new PerfUI.TimelineOverviewPane.OverviewInfo(this._cursorElement);this._updateThrottler=new Common.Throttler(100);this._cursorEnabled=false;this._cursorPosition=0;this._lastWidth=0;}
_onMouseMove(event){if(!this._cursorEnabled)
return;this._cursorPosition=event.offsetX+event.target.offsetLeft;this._cursorElement.style.left=this._cursorPosition+'px';this._cursorElement.style.visibility='visible';this._overviewInfo.setContent(this._buildOverviewInfo());}
async _buildOverviewInfo(){const document=this.element.ownerDocument;const x=this._cursorPosition;const elements=await Promise.all(this._overviewControls.map(control=>control.overviewInfoPromise(x)));const fragment=document.createDocumentFragment();elements.remove(null);fragment.appendChildren.apply(fragment,elements);return fragment;}
_hideCursor(){this._cursorElement.style.visibility='hidden';this._overviewInfo.hide();}
wasShown(){this._update();}
willHide(){this._overviewInfo.hide();}
onResize(){const width=this.element.offsetWidth;if(width===this._lastWidth)
return;this._lastWidth=width;this.scheduleUpdate();}
setOverviewControls(overviewControls){for(let i=0;i<this._overviewControls.length;++i)
this._overviewControls[i].dispose();for(let i=0;i<overviewControls.length;++i){overviewControls[i].setCalculator(this._overviewCalculator);overviewControls[i].show(this._overviewGrid.element);}
this._overviewControls=overviewControls;this._update();}
setBounds(minimumBoundary,maximumBoundary){this._overviewCalculator.setBounds(minimumBoundary,maximumBoundary);this._overviewGrid.setResizeEnabled(true);this._cursorEnabled=true;}
scheduleUpdate(){this._updateThrottler.schedule(process.bind(this));function process(){this._update();return Promise.resolve();}}
_update(){if(!this.isShowing())
return;this._overviewCalculator.setDisplayWidth(this._overviewGrid.clientWidth());for(let i=0;i<this._overviewControls.length;++i)
this._overviewControls[i].update();this._overviewGrid.updateDividers(this._overviewCalculator);this._updateMarkers();this._updateWindow();}
setMarkers(markers){this._markers=markers;}
_updateMarkers(){const filteredMarkers=new Map();for(const time of this._markers.keys()){const marker=this._markers.get(time);const position=Math.round(this._overviewCalculator.computePosition(time));if(filteredMarkers.has(position))
continue;filteredMarkers.set(position,marker);marker.style.left=position+'px';}
this._overviewGrid.removeEventDividers();this._overviewGrid.addEventDividers(filteredMarkers.valuesArray());}
reset(){this._windowStartTime=0;this._windowEndTime=Infinity;this._overviewCalculator.reset();this._overviewGrid.reset();this._overviewGrid.setResizeEnabled(false);this._cursorEnabled=false;this._hideCursor();this._markers=new Map();for(const control of this._overviewControls)
control.reset();this._overviewInfo.hide();this.scheduleUpdate();}
_onClick(event){return this._overviewControls.some(control=>control.onClick(event));}
_onWindowChanged(event){if(this._muteOnWindowChanged)
return;if(!this._overviewControls.length)
return;const absoluteMin=this._overviewCalculator.minimumBoundary();const timeSpan=this._overviewCalculator.maximumBoundary()-absoluteMin;const windowTimes={startTime:absoluteMin+timeSpan*this._overviewGrid.windowLeft(),endTime:absoluteMin+timeSpan*this._overviewGrid.windowRight()};this._windowStartTime=windowTimes.startTime;this._windowEndTime=windowTimes.endTime;this.dispatchEventToListeners(PerfUI.TimelineOverviewPane.Events.WindowChanged,windowTimes);}
setWindowTimes(startTime,endTime){if(startTime===this._windowStartTime&&endTime===this._windowEndTime)
return;this._windowStartTime=startTime;this._windowEndTime=endTime;this._updateWindow();this.dispatchEventToListeners(PerfUI.TimelineOverviewPane.Events.WindowChanged,{startTime:startTime,endTime:endTime});}
_updateWindow(){if(!this._overviewControls.length)
return;const absoluteMin=this._overviewCalculator.minimumBoundary();const timeSpan=this._overviewCalculator.maximumBoundary()-absoluteMin;const haveRecords=absoluteMin>0;const left=haveRecords&&this._windowStartTime?Math.min((this._windowStartTime-absoluteMin)/timeSpan,1):0;const right=haveRecords&&this._windowEndTime<Infinity?(this._windowEndTime-absoluteMin)/timeSpan:1;this._muteOnWindowChanged=true;this._overviewGrid.setWindow(left,right);this._muteOnWindowChanged=false;}};PerfUI.TimelineOverviewPane.Events={WindowChanged:Symbol('WindowChanged')};PerfUI.TimelineOverviewCalculator=class{constructor(){this.reset();}
computePosition(time){return(time-this._minimumBoundary)/this.boundarySpan()*this._workingArea;}
positionToTime(position){return position/this._workingArea*this.boundarySpan()+this._minimumBoundary;}
setBounds(minimumBoundary,maximumBoundary){this._minimumBoundary=minimumBoundary;this._maximumBoundary=maximumBoundary;}
setDisplayWidth(clientWidth){this._workingArea=clientWidth;}
reset(){this.setBounds(0,100);}
formatValue(value,precision){return Number.preciseMillisToString(value-this.zeroTime(),precision);}
maximumBoundary(){return this._maximumBoundary;}
minimumBoundary(){return this._minimumBoundary;}
zeroTime(){return this._minimumBoundary;}
boundarySpan(){return this._maximumBoundary-this._minimumBoundary;}};PerfUI.TimelineOverview=function(){};PerfUI.TimelineOverview.prototype={show(parentElement,insertBefore){},update(){},dispose(){},reset(){},overviewInfoPromise(x){},onClick(event){},};PerfUI.TimelineOverviewBase=class extends UI.VBox{constructor(){super();this._calculator=null;this._canvas=this.element.createChild('canvas','fill');this._context=this._canvas.getContext('2d');}
width(){return this._canvas.width;}
height(){return this._canvas.height;}
context(){return this._context;}
calculator(){return this._calculator;}
update(){this.resetCanvas();}
dispose(){this.detach();}
reset(){}
overviewInfoPromise(x){return Promise.resolve((null));}
setCalculator(calculator){this._calculator=calculator;}
onClick(event){return false;}
resetCanvas(){if(this.element.clientWidth)
this.setCanvasSize(this.element.clientWidth,this.element.clientHeight);}
setCanvasSize(width,height){this._canvas.width=width*window.devicePixelRatio;this._canvas.height=height*window.devicePixelRatio;}};PerfUI.TimelineOverviewPane.OverviewInfo=class{constructor(anchor){this._anchorElement=anchor;this._glassPane=new UI.GlassPane();this._glassPane.setPointerEventsBehavior(UI.GlassPane.PointerEventsBehavior.PierceContents);this._glassPane.setMarginBehavior(UI.GlassPane.MarginBehavior.Arrow);this._glassPane.setSizeBehavior(UI.GlassPane.SizeBehavior.MeasureContent);this._visible=false;this._element=UI.createShadowRootWithCoreStyles(this._glassPane.contentElement,'perf_ui/timelineOverviewInfo.css').createChild('div','overview-info');}
async setContent(contentPromise){this._visible=true;const content=await contentPromise;if(!this._visible)
return;this._element.removeChildren();this._element.appendChild(content);this._glassPane.setContentAnchorBox(this._anchorElement.boxInWindow());if(!this._glassPane.isShowing())
this._glassPane.show((this._anchorElement.ownerDocument));}
hide(){this._visible=false;this._glassPane.hide();}};;Runtime.cachedResources["perf_ui/chartViewport.css"]="/*\n * Copyright 2017 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.chart-viewport-v-scroll {\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    overflow-x: hidden;\n    z-index: 200;\n    padding-left: 1px;\n}\n\n.chart-viewport-v-scroll.always-show-scrollbar {\n    overflow-y: scroll;\n}\n\n/* force non overlay scrollbars for Mac */\n:host-context(.platform-mac) .chart-viewport-v-scroll {\n    right: 2px;\n    top: 3px;\n    bottom: 3px;\n}\n\n:host-context(.platform-mac) ::-webkit-scrollbar {\n    width: 8px;\n}\n\n:host-context(.platform-mac) ::-webkit-scrollbar-thumb {\n    background-color: hsla(0, 0%, 56%, 0.6);\n    border-radius: 50px;\n}\n\n:host-context(.platform-mac) .chart-viewport-v-scroll:hover::-webkit-scrollbar-thumb {\n    background-color: hsla(0, 0%, 25%, 0.6);\n}\n\n/* force non overlay scrollbars for Aura Overlay Scrollbar enabled */\n:host-context(.overlay-scrollbar-enabled) ::-webkit-scrollbar {\n    width: 10px;\n}\n\n:host-context(.overlay-scrollbar-enabled) ::-webkit-scrollbar-thumb {\n    background-color: hsla(0, 0%, 0%, 0.5);\n}\n\n:host-context(.overlay-scrollbar-enabled) .chart-viewport-v-scroll:hover::-webkit-scrollbar-thumb {\n    background-color: hsla(0, 0%, 0%, 0.7);\n}\n\n.chart-viewport-selection-overlay {\n    position: absolute;\n    z-index: 100;\n    background-color: rgba(56, 121, 217, 0.3);\n    border-color: rgb(16, 81, 177);\n    border-width: 0 1px;\n    border-style: solid;\n    pointer-events: none;\n    top: 0;\n    bottom: 0;\n    text-align: center;\n}\n\n.chart-viewport-selection-overlay .time-span {\n    white-space: nowrap;\n    position: absolute;\n    left: 0;\n    right: 0;\n    bottom: 0;\n}\n\n/*# sourceURL=perf_ui/chartViewport.css */";Runtime.cachedResources["perf_ui/filmStripView.css"]="/*\n * Copyright (c) 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.film-strip-view {\n    overflow-x: auto;\n    overflow-y: hidden;\n    align-content: flex-start;\n    min-height: 81px;\n}\n\n.film-strip-view.time-based .frame .time {\n    display: none;\n}\n\n.film-strip-view .label {\n    margin: auto;\n    font-size: 18px;\n    color: #999;\n}\n\n.film-strip-view .frame {\n    display: flex;\n    flex-direction: column;\n    align-items: center;\n    padding: 4px;\n    flex: none;\n    cursor: pointer;\n}\n\n.film-strip-view .frame .thumbnail {\n    min-width: 24px;\n    display: flex;\n    flex-direction: row;\n    align-items: center;\n    pointer-events: none;\n    margin: 4px 0 2px;\n    border: 2px solid transparent;\n}\n\n.film-strip-view .frame:hover .thumbnail {\n    border-color: #FBCA46;\n}\n\n.film-strip-view .frame .thumbnail img {\n    height: auto;\n    width: auto;\n    max-width: 80px;\n    max-height: 50px;\n    pointer-events: none;\n    box-shadow: 0 0 3px #bbb;\n    flex: 0 0 auto;\n}\n\n.film-strip-view .frame:hover .thumbnail img {\n    box-shadow: none;\n}\n\n.film-strip-view .frame .time {\n    font-size: 10px;\n    margin-top: 2px;\n}\n\n/*# sourceURL=perf_ui/filmStripView.css */";Runtime.cachedResources["perf_ui/flameChart.css"]="/*\n * Copyright 2017 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.flame-chart-main-pane {\n    overflow: hidden;\n}\n\n.flame-chart-marker-highlight-element {\n    position: absolute;\n    top: 1px;\n    height: 18px;\n    width: 6px;\n    margin: 0 -3px;\n    content: \"\";\n    display: block;\n}\n\n.flame-chart-highlight-element {\n    position: absolute;\n    pointer-events: none;\n    background-color: rgba(56, 121, 217, 0.1);\n}\n\n.flame-chart-selected-element {\n    position: absolute;\n    pointer-events: none;\n    outline: 2px solid var(--selection-bg-color);\n    background-color: rgba(56, 121, 217, 0.1);\n}\n\n.chart-cursor-element {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    z-index: 100;\n    width: 2px;\n    background-color: var(--selection-bg-color);\n    pointer-events: none;\n}\n\n.flame-chart-entry-info:not(:empty) {\n    z-index: 2000;\n    position: absolute;\n    background-color: white;\n    pointer-events: none;\n    padding: 4px 8px;\n    white-space: nowrap;\n    max-width: 80%;\n    box-shadow: var(--drop-shadow);\n}\n\n.flame-chart-entry-info table tr td:empty {\n    padding: 0;\n}\n\n.flame-chart-entry-info table tr td:not(:empty) {\n    padding: 0 5px;\n    white-space: nowrap;\n}\n\n.flame-chart-entry-info table tr td:first-child {\n    font-weight: bold;\n}\n\n.flame-chart-entry-info table tr td span {\n    margin-right: 5px;\n}\n\n/*# sourceURL=perf_ui/flameChart.css */";Runtime.cachedResources["perf_ui/overviewGrid.css"]="/*\n * Copyright (c) 2014 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.overview-grid-window-selector {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    background-color: rgba(125, 173, 217, 0.5);\n    z-index: 250;\n    pointer-events: none;\n}\n\n.overview-grid-window-resizer {\n    position: absolute;\n    top: -1px;\n    height: 20px;\n    width: 6px;\n    margin-left: -3px;\n    background-color: rgb(153, 153, 153);\n    border: 1px solid white;\n    z-index: 500;\n}\n\n.overview-grid-cursor-area {\n    position: absolute;\n    left: 0;\n    right: 0;\n    top: 20px;\n    bottom: 0;\n    z-index: 500;\n    cursor: text;\n}\n\n.overview-grid-cursor-position {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    width: 2px;\n    background-color: hsla(220, 95%, 50%, 0.7);\n    z-index: 500;\n    pointer-events: none;\n    visibility: hidden;\n    overflow: hidden;\n}\n\n.window-curtain-left, .window-curtain-right {\n    background-color: hsla(0, 0%, 80%, 0.5);\n    position: absolute;\n    top: 0;\n    height: 100%;\n    z-index: 300;\n    pointer-events: none;\n    border: 1px none hsla(0, 0%, 70%, 0.5);\n}\n\n.window-curtain-left {\n    left: 0;\n    border-right-style: solid;\n}\n\n.window-curtain-right {\n    right: 0;\n    border-left-style: solid;\n}\n\n/*# sourceURL=perf_ui/overviewGrid.css */";Runtime.cachedResources["perf_ui/pieChart.css"]="/*\n * Copyright (c) 2014 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.root {\n    align-items: center;\n    display: flex;\n    min-width: fit-content;\n    white-space: nowrap;\n}\n\n.chart-root {\n    position: relative;\n    overflow: hidden;\n}\n\n.pie-chart-foreground {\n    position: absolute;\n    width: 100%;\n    height: 100%;\n    z-index: 10;\n    top: 0;\n    display: flex;\n    pointer-events: none;\n}\n\n.pie-chart-total {\n    margin: auto;\n    padding: 2px 5px;\n    background-color: rgba(255, 255, 255, 0.6);\n    pointer-events: auto;\n}\n\n.pie-chart-legend {\n    margin-left: 30px;\n}\n\n.pie-chart-legend-row {\n    margin: 5px auto;\n    padding-right: 25px;\n}\n\n.pie-chart-swatch {\n    display: inline-block;\n    width: 11px;\n    height: 11px;\n    margin: 0 6px;\n    top: 1px;\n    position: relative;\n    border: 1px solid rgba(100, 100, 100, 0.2);\n}\n\n.pie-chart-swatch.pie-chart-empty-swatch {\n    border: none;\n}\n\n.pie-chart-name {\n    display: inline-block;\n}\n\n.pie-chart-size {\n    display: inline-block;\n    text-align: right;\n    width: 70px;\n}\n\n/*# sourceURL=perf_ui/pieChart.css */";Runtime.cachedResources["perf_ui/timelineGrid.css"]="/*\n * Copyright (c) 2015 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.resources-dividers {\n    position: absolute;\n    left: 0;\n    right: 0;\n    top: 0;\n    z-index: -100;\n    bottom: 0;\n}\n\n.resources-event-dividers {\n    position: absolute;\n    left: 0;\n    right: 0;\n    height: 100%;\n    top: 0;\n    z-index: 300;\n    pointer-events: none;\n}\n\n.resources-dividers-label-bar {\n    position: absolute;\n    top: 0;\n    left: 0;\n    right: 0;\n    background-color: rgba(255, 255, 255, 0.85);\n    background-clip: padding-box;\n    height: 20px;\n    z-index: 200;\n    pointer-events: none;\n    overflow: hidden;\n}\n\n.resources-divider {\n    position: absolute;\n    width: 1px;\n    top: 0;\n    bottom: 0;\n    background-color: rgba(0, 0, 0, 0.1);\n}\n\n.resources-event-divider {\n    position: absolute;\n    width: 1px;\n    top: 0;\n    bottom: 0;\n    z-index: 300;\n}\n\n.resources-divider-label {\n    position: absolute;\n    top: 4px;\n    right: 3px;\n    font-size: 80%;\n    white-space: nowrap;\n    pointer-events: none;\n}\n\n.timeline-grid-header {\n    height: 20px;\n    pointer-events: none;\n}\n\n/*# sourceURL=perf_ui/timelineGrid.css */";Runtime.cachedResources["perf_ui/timelineOverviewInfo.css"]="/*\n * Copyright 2017 The Chromium Authors. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n\n.overview-info:not(:empty) {\n    display: flex;\n    background: white;\n    box-shadow: var(--drop-shadow);\n    padding: 3px;\n}\n\n.overview-info .frame .time {\n    display: none;\n}\n\n.overview-info .frame .thumbnail img {\n    max-width: 50vw;\n    max-height: 50vh;\n}\n\n/*# sourceURL=perf_ui/timelineOverviewInfo.css */";