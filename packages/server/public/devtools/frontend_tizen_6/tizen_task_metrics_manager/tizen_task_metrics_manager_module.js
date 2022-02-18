'use strict'
TizenTaskMetricsManager.Panel=class extends UI.Panel{constructor(){super('tizen-task-metrics-manager')
this.registerRequiredCSS('tizen_task_metrics_manager/taskManager.css')
this._box=new TizenTaskMetricsManager.Box()
this._box.show(this.element)
this._metricsModel=SDK.targetManager.mainTarget().model(SDK.PerformanceMetricsModel)
this._metricsModel.enableTaskInfo()
for(let metrics of TizenTaskMetricsManager.TASK_METRICS_NAMES)
this._metricsModel.startCollectingTaskMetrics(metrics)
this._pollIntervalInMs=500
this._pollHandle=setInterval(()=>{this._poll()},this._pollIntervalInMs)}
async _poll(){var metrics=await this._metricsModel.requestTaskMetrics()
setTimeout(()=>{this._box.onMetrics(metrics)},0)}}
TizenTaskMetricsManager.Box=class extends UI.HBox{constructor(){super(true)
this.registerRequiredCSS('tizen_task_metrics_manager/taskManager.css')
this.contentElement.classList.add('task-manager-box')
this._table=(this.contentElement.createChild('table'))
let thead=this._table.createTHead()
let thead_row=thead.insertRow()
for(let column in TizenTaskMetricsManager.COLUMNS_TO_TASK_METRICS){let th=document.createElement('th')
th.appendChild(document.createTextNode(column))
thead_row.appendChild(th)
th.onclick=()=>{let i=0
for(let col in TizenTaskMetricsManager.COLUMNS_TO_TASK_METRICS){i++
if(col===column)break}
if(Math.abs(this._column_sort===i))i=-i
this._column_sort=i}}
this._column_sort=0}
onMetrics(metrics_arr){while(this._table.childElementCount>1)
this._table.removeChild(this._table.childNodes[this._table.childElementCount-1])
for(let metrics of metrics_arr){let tr_arr=[]
for(let title of metrics['title']){let tr=document.createElement('tr')
let td=document.createElement('td')
td.appendChild(document.createTextNode(title))
tr.appendChild(td)
tr_arr.push(tr)}
for(let column in TizenTaskMetricsManager.COLUMNS_TO_TASK_METRICS){let metrics_value=TizenTaskMetricsManager.COLUMNS_TO_TASK_METRICS[column]
if(metrics_value==='title')continue
let met=metrics[metrics_value]
let text="-"
if(met==null)text="-"
else if((typeof(met)!='number'&&typeof(met)!='object')||metrics_value==='id')text=met.toString()
else{if(column=='CPU'||column=='IDLE_WAKEUPS')text=TizenTaskMetricsManager.numberFormatter(met,'')
else text=TizenTaskMetricsManager.numberFormatter(met)
if(column=='JavaScript memory'&&text!='-'){let met_added=metrics['v8_memory_used'];text=text+' ('+TizenTaskMetricsManager.numberFormatter(met_added)+' live)'}
if(column=='Image cache'&&met!=undefined){let image_cache=met['images']
let size=image_cache['size']
text=TizenTaskMetricsManager.numberFormatter(size)}else if(column=='Script cache'&&met!=undefined){let script_cache=met['scripts']
let size=script_cache['size']
text=TizenTaskMetricsManager.numberFormatter(size)}else if(column=='CSS cache'&&met!=undefined){let css_cache=met['css_style_sheets']
let size=css_cache['size']
text=TizenTaskMetricsManager.numberFormatter(size)}}
let td=document.createElement('td')
td.rowSpan=tr_arr.length
td.appendChild(document.createTextNode(text))
tr_arr[0].appendChild(td)}
let tbody=document.createElement('tbody')
for(let tr of tr_arr)
tbody.appendChild(tr)
this._sortedInsert(tbody)}}
_sortedInsert(new_tbody){let abs_column_sort=Math.abs(this._column_sort)-1
if(this._table.childElementCount>=2&&this._column_sort!==0){for(let i=1;i<this._table.childElementCount;i++){let old_value,new_value
if(abs_column_sort!==0){old_value=parseFloat(this._table.childNodes[i].childNodes[0].childNodes[abs_column_sort].innerText)
new_value=parseFloat(new_tbody.childNodes[0].childNodes[abs_column_sort].innerText)}
else{old_value=this._table.childNodes[i].childNodes[0].childNodes[abs_column_sort].innerText
new_value=new_tbody.childNodes[0].childNodes[abs_column_sort].innerText}
let insert=this._column_sort>0?old_value<new_value:old_value>new_value
if(insert){this._table.insertBefore(new_tbody,this._table.childNodes[i])
return}}}
this._table.appendChild(new_tbody)}}
TizenTaskMetricsManager.TASK_METRICS_NAMES=['ID','TITLE','CPU','GPU_MEMORY','SQLITE_MEMORY','IDLE_WAKEUPS','MEMORY','V8_MEMORY','WEBCACHE_STATS','NETWORK_USAGE','NACL','PRIORITY']
TizenTaskMetricsManager.COLUMNS_TO_TASK_METRICS={'Task':'title','CPU':'platform_independent_cpu_usage','Process ID':'id','GPU memory':'gpu_memory','SQLite memory':'used_sqlite_memory','Idle wake ups':'idle_wakeups_per_second','Memory footprint':'memory_footprint','JavaScript memory':'v8_memory_allocated','Image cache':'webcache_stats','Script cache':'webcache_stats','CSS cache':'webcache_stats'}
TizenTaskMetricsManager.numberFormatter=function(number,additional_string='K'){var quotient,remainder
if(!Number.isInteger(number)){quotient=(Math.floor(number)).toString()
remainder=(number%1).toFixed(4).toString()}
else{number=Math.trunc(number/1000);quotient=number.toString()
remainder=""}
return quotient.replace(/(\d)(?=(\d{3})+(?!\d))/g,'$1,').concat(remainder.substr(1))+additional_string;};Runtime.cachedResources["tizen_task_metrics_manager/taskManager.css"]="/*\n * Copyright 2019 Samsung Electronics Inc. All rights reserved.\n * Use of this source code is governed by a BSD-style license that can be\n * found in the LICENSE file.\n */\n.task-manager-box {\n    overflow: auto;\n    margin: 1em;\n}\n\n.task-manager-box table {\n    border-collapse: collapse;\n    table-layout: auto;\n    width: 100%;\n}\n\n.task-manager-box th, td {\n    padding: 0.3em;\n    word-wrap: break-word;\n    text-align: right;\n}\n\n.task-manager-box th {\n    background-color: #394db2;\n    color: white;\n    cursor: pointer;\n}\n\n.task-manager-box td:nth-child(1), th:nth-child(1) {\n    text-align: left;\n}\n\n.task-manager-box tbody:nth-child(even) {\n    background-color: #c2c8e7;\n}\n\n.task-manager-box tbody:nth-child(odd) {\n    background-color: #e1e4f3;\n}\n\n.task-manager-box tbody:hover td[rowspan], tr:hover td {\n    background-color: #909dd4;\n}\n\n/*# sourceURL=tizen_task_metrics_manager/taskManager.css */";