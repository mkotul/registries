'use strict';

angular.module('psui-datepicker', [])
.directive('psuiDatepicker', ['$timeout', function ($timeout) {
	return {
		restrict: 'AE',
		scope: {
			ngModel: "=?"
		},
		require: ['?ngModel'],
		link: function(scope, elm, attrs, ctrls) {
		
		
			var ngModel = null;
			if (ctrls && ctrls[0]) {
				ngModel = ctrls[0];
			}

			// use empty function to commit data, it will be overriden if there is ngModel
			var commitData = function() {
			}
			
			var commitDataDiv = function() {
			}

			if (ngModel) {
				commitData = function() {
					ngModel.$setViewValue(elm.val());
				}
				
				commitDataDiv = function() {
					ngModel.$setViewValue(elm.text());
				}
			}
		
		
		
		
		
		
			var wrapper;
			var isDropdownVisible = false;
			var state = 0;
			// create base html elements
			if (elm.parent().hasClass('psui-wrapper')) {
				// element is wrapped, we are going to use this wrapper
				wrapper = elm.parent();
			} else {
				// there is no wrapper, we have to create one
				wrapper = angular.element('<div class="psui-wrapper"></div>');
				elm.wrap(wrapper);
			}
			
			if (elm.nodeName === "psui-datepicker") {
				// we are element
			} else {
				// we are attribute
			}

			elm.addClass('psui-datepicker');
			
			var dropdown = angular.element('<div class="psui-dropdown psui-hidden"></div>');
			wrapper.append(dropdown);
			
			dropdown.addClass('psui-datepicker-dropdown');
			
			dropdown.attr('tabindex',0);
			var buttonsHolder = angular.element('<div class="psui-buttons-holder"></div>');
			wrapper.append(buttonsHolder);
			
			var buttonShowDropdown = angular.element('<button class="btn psui-icon-chevron-down"></button>');
			buttonsHolder.append(buttonShowDropdown);
    
			var dropdownHide = function() {
				dropdown.addClass('psui-hidden');
			};
			
			var hideDropdown;
			
			dropdown.on('focus',function(evt){
				$timeout.cancel(hideDropdown);
				hideDropdown = null;
				dropdown.removeClass('psui-hidden');
			})
			
			dropdown.on('blur',function(evt){
				//dropdown.addClass('psui-hidden');
				hideDropdown = $timeout(dropdownHide, 3, false);
			})
			
			elm.on('blur',function(evt){
				hideDropdown = $timeout(dropdownHide, 3, false);
				
				state=0;
			})
			
			elm.on('focus',function(evt){
				dropdown.addClass('psui-hidden');
				state=1;
			})
			
			elm.on('click',function(evt){
				if (state =1){
					dropdown.addClass('psui-hidden');
				}
			})
			
			buttonShowDropdown.on('blur',function(evt){
				hideDropdown = $timeout(dropdownHide, 3, false);
			})
			
			var selDate;
			
			buttonShowDropdown.on('click', function(evt) {
				if(hideDropdown){
					$timeout.cancel(hideDropdown);
					hideDropdown = null;
					dropdown.removeClass('psui-hidden');
				}
				console.log('a');
				if (dropdown.hasClass('psui-hidden')) {
					dropdown.removeClass('psui-hidden');
					if (elm.val()){
						var arr = elm.val().split(".");
						if((arr[0] && arr[1] && arr[2]) && arr[0]>0 && arr[0]<32 && arr[1]>0 && arr[1]<13){
							arr[1]= arr[1]-1;
							var datum = new Date(arr[2], arr[1], arr[0]);
							selDate = new Date(datum.getTime());
							dateTbody.empty();
							makeDateTable(datum);
						}
					}
					console.log('b');
				} else {
					dropdown.addClass('psui-hidden');
					console.log('c');
				}
			});
			
			elm.on('dblclick', function(evt){
				if (dropdown.hasClass('psui-hidden')) {
					if(elm.val()){
						var arr = elm.val().split(".");
						if((arr[0] && arr[1] && arr[2]) && arr[0]>0 && arr[0]<32 && arr[1]>0 && arr[1]<13){
							arr[1]= arr[1]-1;
							var datum = new Date(arr[2], arr[1], arr[0]);
							selDate = new Date(datum.getTime());
							dateTbody.empty();
							makeDateTable(datum);
							
						}
					}
					dropdown.removeClass('psui-hidden');
				} else {
					dropdown.addClass('psui-hidden');
				}
			})
			
			var dateTable = angular.element('<table></table>');
			var dateTbody = angular.element('<tbody></tbody>');
			dateTable.append(dateTbody);
			dropdown.append(dateTable);
			
			
			var whichMonth = function(month){
				if (month == 0){
					return "Jan";
				}else if (month == 1){
					return "Feb";
				}else if (month == 2){
					return "Mar";
				}else if (month == 3){
					return "Apr";
				}else if (month == 4){
					return "Maj";
				}else if (month == 5){
					return "Jun";
				}else if (month == 6){
					return "Jul";
				}else if (month == 7){
					return "Aug";	
				}else if (month == 8){
					return "Sep";
				}else if (month == 9){
					return "Okt";
				}else if (month == 10){
					return "Nov";
				}else if (month == 11){
					return "Dec";
				}
			}
			
			
			var makeDateTable = function(date){
				var tr,td;
				tr = angular.element('<tr></tr>');
			
				td = angular.element('<td class="action-previous"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					
					var element = angular.element(evt.target);
					var prevMonth = new Date (element.data("datum").getTime());
					prevMonth.setMonth(prevMonth.getMonth()-1);
					dateTbody.empty();
					makeDateTable(prevMonth);
				})
				tr.append(td);
				td = angular.element('<td colspan="5" class="action-date">' + whichMonth(date.getMonth()) + ' ' + date.getFullYear() + '</td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click',function(evt){
					var element = angular.element(evt.target);
					var thisMonth = new Date (element.data("datum").getTime());
					dateTbody.empty();
					makeMonthTable(thisMonth);
				})
				tr.append(td);
				td = angular.element('<td  class="action-next"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					
					var element = angular.element(evt.target);
					var nextMonth = new Date (element.data("datum").getTime());
					nextMonth.setMonth(nextMonth.getMonth()+1);
					dateTbody.empty();
					makeDateTable(nextMonth);
				})
				tr.append(td);
				dateTbody.append(tr);
				
				tr = angular.element('<tr></tr>');
				td = angular.element('<td colspan="7" class="action-current-day">Current Day</td>');
				td.data("datum", new Date() );
				td.on('click', function(evt){
				
					var element = angular.element(evt.target);
					var curDate = new Date (element.data("datum").getTime());
					dateTbody.empty();
					makeDateTable(curDate);
				
				})
				tr.append(td);
				dateTbody.append(tr);
				
				tr = angular.element('<tr class="labels"></tr>');
				
				td = angular.element('<td>Po</td>'); 
				tr.append(td);
				td = angular.element('<td>Ut</td>'); 
				tr.append(td);
				td = angular.element('<td>St</td>'); 
				tr.append(td);
				td = angular.element('<td>Št</td>'); 
				tr.append(td);
				td = angular.element('<td>Pi</td>'); 
				tr.append(td);
				td = angular.element('<td>So</td>'); 
				tr.append(td);
				td = angular.element('<td>Ne</td>'); 
				tr.append(td);
				
				dateTbody.append(tr);
				
				var currentDate = new Date;
				
				var month = date.getMonth();
				var dayNumber = date.getDate();
				date.setDate(date.getDate()-dayNumber +1);
				
				var whichDay = date.getDay() -1;
				if (whichDay == -1){
					whichDay = 6;
				}
				
				var curClass = "";
				var selClass = "";
				if (whichDay == 0){
				date.setDate(date.getDate()-7);
				}else {
				date.setDate(date.getDate()- whichDay);
				}
				
				console.log(selDate);
				
				for (var i = 0; i<6; i++){
					tr = angular.element('<tr class="days"></tr>');
					for (var j = 0; j<7; j++){
						if (month == date.getMonth()){
							if (date.getDate() == currentDate.getDate() && currentDate.getMonth() == date.getMonth() && currentDate.getFullYear() == date.getFullYear()){
								curClass="current"
							} else {
								curClass="";
							}
							if (selDate && date.getDate() == selDate.getDate() && selDate.getMonth() == date.getMonth() && selDate.getFullYear() == date.getFullYear()){
								selClass="selected";
							} else {
								selClass="";
							}
							td = angular.element('<td class="'+ curClass + ' ' + selClass +'">' + date.getDate() + '</td>');
						} else{
							td = angular.element('<td class="other">' + date.getDate() + '</td>');
						}
						td.data("datum",new Date(date.getTime()));
						
						td.on('click', function(evt){
							var element = angular.element(evt.target);
							var chosenDay = element.data("datum").getDate();
							var chosenMonth = element.data("datum").getMonth() + 1;
							var chosenYear = element.data("datum").getFullYear();
							
							if (elm[0].nodeName === "DIV"){
								elm.text(chosenDay + '.' + chosenMonth + '.' + chosenYear);
								scope.$apply(commitDataDiv);
							} else {
								elm.val(chosenDay + '.' + chosenMonth + '.' + chosenYear);
								scope.$apply(commitData);
							}
							
							dropdown.addClass('psui-hidden');
						})
						tr.append(td);
						date.setDate(date.getDate() + 1);
					}
					dateTbody.append(tr);
				}
			
			}
			
			
			var makeMonthTable = function(date){
				var tr,td;
				
				tr = angular.element('<tr></tr>');
			
				td = angular.element('<td  class="action-previous"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					
					var element = angular.element(evt.target);
					var prevYear = new Date (element.data("datum").getTime());
					prevYear.setFullYear(prevYear.getFullYear()-1);
					dateTbody.empty();
					makeMonthTable(prevYear);
				})
				tr.append(td);
				td = angular.element('<td colspan="2" class="action-date">' + date.getFullYear() + '</td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click',function(evt){
					var element = angular.element(evt.target);
					var thisYear = new Date (element.data("datum").getTime());
					dateTbody.empty();
					makeYearTable(thisYear);
				})
				tr.append(td);
				td = angular.element('<td class="action-next"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					
					var element = angular.element(evt.target);
					var nextYear = new Date (element.data("datum").getTime());
					nextYear.setFullYear(nextYear.getFullYear()+1);
					dateTbody.empty();
					makeMonthTable(nextYear);
				})
				tr.append(td);
				dateTbody.append(tr);
				
				tr = angular.element('<tr></tr>');
				td = angular.element('<td colspan="7"  class="action-current-day">Current Day</td>');
				td.data("datum", new Date() );
				td.on('click', function(evt){
				
					var element = angular.element(evt.target);
					var curDate = new Date (element.data("datum").getTime());
					dateTbody.empty();
					makeDateTable(curDate);
				
				})
				tr.append(td);
				dateTbody.append(tr);
				
				var month = 0;
				var dateMonthTable = new Date (date.getTime());
				for (var i = 0; i<3; i++){
					tr = angular.element('<tr class="months"></tr>');
					for (var j = 0; j<4; j++){
						td = angular.element('<td>' + whichMonth(month) + '</td>');
						dateMonthTable.setMonth(month);
						td.data("datum",new Date(dateMonthTable.getTime()));
						
						td.on('click', function(evt){
							var element = angular.element(evt.target);
							var thisDate = new Date (element.data("datum").getTime());
							dateTbody.empty();
							makeDateTable(thisDate);
						})
						tr.append(td);
						month = month + 1;
					}
					dateTbody.append(tr);
				}
			
			}
			
			var makeYearTable = function(date){
				var tr,td;
				
				tr = angular.element('<tr></tr>');
			
				td = angular.element('<td class="action-previous"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					
					var element = angular.element(evt.target);
					var prevYears = new Date (element.data("datum").getTime());
					prevYears.setFullYear(prevYears.getFullYear()-9);
					dateTbody.empty();
					makeYearTable(prevYears);
				})
				tr.append(td);
				td = angular.element('<td></td>'); 
				tr.append(td);
				td = angular.element('<td class="action-next"></td>'); 
				td.data("datum",new Date(date.getTime()));
				td.on('click', function(evt){
					
					var element = angular.element(evt.target);
					var nextYears = new Date (element.data("datum").getTime());
					nextYears.setFullYear(nextYears.getFullYear()+9);
					dateTbody.empty();
					makeYearTable(nextYears);
				})
				tr.append(td);
				dateTbody.append(tr);
				
				tr = angular.element('<tr></tr>');
				td = angular.element('<td colspan="7" class="action-current-day">Current Day</td>');
				td.data("datum", new Date() );
				td.on('click', function(evt){
				
					var element = angular.element(evt.target);
					var curDate = new Date (element.data("datum").getTime());
					dateTbody.empty();
					makeDateTable(curDate);
				
				})
				tr.append(td);
				dateTbody.append(tr);
				
				var year = date.getFullYear() - 4;
				var dateYearTable = new Date (date.getTime());
				
				for (var i = 0; i<3; i++){
					tr = angular.element('<tr class="years"></tr>');
					for (var j = 0; j<3; j++){
						td = angular.element('<td>' + year + '</td>');
						dateYearTable.setFullYear(year);
						td.data("datum",new Date(dateYearTable.getTime()));
						
						td.on('click', function(evt){
							var element = angular.element(evt.target);
							var thisYear = new Date (element.data("datum").getTime());
							dateTbody.empty();
							makeMonthTable(thisYear);
						})
						tr.append(td);
						year = year + 1;
					}
					dateTbody.append(tr);
				}
			
			}
			
			
			
			var d = new Date();
			
			makeDateTable(d);
			
			
			
			
		}
	}
}])
