function opportunitiesCtrl($scope,$state,$stateParams,$localStorage,OpportunitiesService,AuthService) {
	$scope.loading = false;
	$scope.token = null;
	$scope.list = [];
	$scope.error = false;
	$scope.filter = 'all';
	$scope.page = 1;
	$scope.filters = {};

	function init_params() {
		if ($state.current.name == 'index.portal_gv') {
			$scope.filters['programmes'] = 1;
			$scope.filters['is_ge'] = undefined;
		} else if ($state.current.name == 'index.portal_ge') {
			$scope.filters['programmes'] = 2;
			$scope.filters['is_ge'] = true;
		} else if ($state.current.name == 'index.portal_gt') {
			$scope.filters['programmes'] = 2;
			$scope.filters['is_ge'] = false;
		}
		$scope.filters['committee'] = ($stateParams.lc != undefined && $stateParams.lc != "") ? $stateParams.lc : undefined;
		$scope.filters['home_mcs'] = ($stateParams.lc == undefined || $stateParams.lc == "") ? 1606 : undefined;
		$scope.filters['work_fields'] = ($stateParams.background != undefined) ? map_background($stateParams.background) : undefined; 
		if ($stateParams.sdg != undefined) {
			$scope.filters['sdg_goals'] = $stateParams.sdg;
			$scope.filter = $stateParams.sdg;
		}
	}
	
	function get_opportunities(page) {
		init_params();
		$scope.loading = true;
		OpportunitiesService.list($localStorage.token,page,$scope.filters).then(
			function(response) {
				console.log('Rolou! '+response.status);
				console.log(response.data);
				$scope.list = $scope.list.concat(response.data.data);
				$scope.loading = false;
			},
			function(response) {
				console.log('Não rolou '+response.status);
				console.log('Não rolou '+response.data);
				$scope.loading = false;
				$scope.error = true;
				$localStorage.token = null;
				$state.reload();
		});
	};

	if ($localStorage.token==null) {
		AuthService.simple_token().then(function(token) {
			if (token == null){ 
				$localStorage.token = null;
				$state.reload();
			} else {
				$localStorage.token = token;
			}
			get_opportunities(1);
		});
	} else {
		get_opportunities(1);
	}

	$scope.more_opportunities = function() {
		$scope.error = false;
		$scope.page++;
		get_opportunities($scope.page);
				console.log($scope.list);
		mixpanel.track("more_opportunities", {"sdg": $scope.filter});
	};

	$scope.filterSDG = function(sdg) {
		mixpanel.track("filterSDG", {"sdg": sdg});
		$scope.filter = sdg;
		$state.go($state.current,{'sdg':sdg,'scrollTo':'portal'});
	};


	$scope.filterBackground = function(profile) {
		console.log(profile)
		mixpanel.track("filterSDG", {"background": profile});
		$scope.filter = profile;
		$state.go($state.current,{'background':profile,'scrollTo':'portal'});
	};

	function map_background(profile) {
		switch(profile) {
		    case 'it':
		        return [717,719,727,735,738];
		    case 'engineering':
		        return [720,724,735,736,738];
		    case 'marketing':
		        return [716,717,718,719,721,722,730,739,743];
		    case 'ba':
		        return [715,717,719,720,721,725,726,728,729,732,733,735,736,737,739,740,734,741];
		    case 'education':
		        return [742,718,723,743];
		    default:
		        return [];
		}
	}

	$scope.sdg_color = function(sdg) {
		switch(sdg) {
			case 0:
				return 'danger';
				break;
			case 1:
				return 'pink';
				break;
			case 2:
				return 'invert';
				break;
			case 3:
				return 'success';
				break;
			default:
				return 'success';
		}
	};

	$scope.filter_map = function(filter) {
		switch(filter) {
			case 'all':
				return 'All';
				break;
			case 1104 || "1104":
				return "Quality Education";
				break;
			case 1110 || "1110":
				return "Reduced Inequalities";
				break;
			case 1113 || "1113":
				return "Climate Action";
				break;
			case 1117 || "1117":
				return "Partnership for the Goals";
				break;
			default:
				return filter;
		}
	}
};

function OpportunityDetailCtrl($scope,$state,$stateParams,$localStorage,OpportunitiesService,AuthService) {
	$scope.opportunity = null;

	if ($localStorage.token==null) {
		AuthService.simple_token().then(function(token) {
			if (token == null){ 
				$localStorage.token = null;
				$state.reload();
			} else {
				$localStorage.token = token;
			}
			load_opportunity();
		});
	} else {
		load_opportunity();
	}

	function load_opportunity() {
		console.log($stateParams);
		OpportunitiesService.find($localStorage.token,$stateParams.id).then(
			function(response) {
				console.log(response);
				$scope.opportunity = response.data;
			},function(response) {
				console.log(response);
			});
	}
}

angular
    .module('impactbrazil')
    .controller('opportunitiesCtrl', opportunitiesCtrl)
    .controller('OpportunityDetailCtrl', OpportunityDetailCtrl);