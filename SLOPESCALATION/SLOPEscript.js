
jQuery(document).ready(function($) {
    // Define Submit Button ID
        let submit_id = '#nc-submit';
    // Define Mounting Point for Results
        let mount = '#nutrition-results';
    // Define Warning Catcher
        let warning_catcher = '#warning-catcher';
  
    // Define Default Data Object
        var form_data = {
            body_weight: '#nc-weight',
            body_fat: '#nc-bfp',
            nutrition_goal: '#nc-goal',
            calories: '#nc-mod-calories',
            carbs: '#nc-mod-carbs',
            protein: '#nc-mod-protein',
        };
 
    // Define Custom Range for Macros that will be served from DB
        var custom_range = {
            cals_low: '#nc-macro-low-calories',
            cals_high: '#nc-macro-high-calories',
            carb_low: '#nc-macro-low-carbs',
            carb_high: '#nc-macro-high-carbs',
            prot_low: '#nc-macro-low-protein',
            prot_high: '#nc-macro-high-protein',
        };
  
    // Define Results Map which contains the selector locations to append the results data
        var results_map = {
            r_cals_low:  '#r-cals-low',
            r_cals_high: '#r-cals-high',
            r_cals_avg:  '#r-cals-avg',
            r_cals_pct:  '#r-cals-pct',
            r_carb_low:  '#r-carb-low',
            r_carb_high: '#r-carb-high',
            r_carb_avg:  '#r-carb-avg',
            r_carb_pct:  '#r-carb-pct',
            r_prot_low:  '#r-prot-low',
            r_prot_high: '#r-prot-high',
            r_prot_avg:  '#r-prot-avg',
            r_prot_pct:  '#r-prot-pct',
            r_fats_low:  '#r-fats-low',
            r_fats_high: '#r-fats-high',
            r_fats_avg:  '#r-fats-avg',
            r_fats_pct: '#r-fats-pct',
        };

    // Define Dynamic Goal Presets for Database Portion  
        let goals = [
            {
                name: 'Fat Loss', 
                val: 'fat_loss',
                data: {cals_low: 12, cals_high: 16, carb_low: 0.5, carb_high: 1, prot_low: 1, prot_high: 1.4},
            },
            {
                name: 'Hypertrophy', 
                val: 'hypertrophy',
                data: {cals_low: 16, cals_high: 20, carb_low: 1, carb_high: 2, prot_low: 1.6, prot_high: 2},
            },
            {
                name: 'Conditioning', 
                val: 'conditioning',
                data: {cals_low: 14, cals_high: 18, carb_low: 0.75, carb_high: 1.5, prot_low: 1.2, prot_high: 1.6},
            },
        ];
  
    // Caloric Range Function Calculator
        function CalculateRange(modifier, low_value, high_value, lbm) {
            // Define Custom Range Coefficients for Macros
            let mod_ranges = {
              low: {sm: 0,         lg: 0.333333},
              mod: {sm: 0.333333,  lg: 0.666666},
              high: {sm: 0.666666, lg: 1},
            };

            console.log({
              modifier: modifier,
              low_value: low_value,
              high_value: high_value,
              lbm: lbm,
            });

            console.log({
              goal_sub_low: (mod_ranges[modifier].sm * (high_value - low_value) ),
              goal_sub_high: (mod_ranges[modifier].lg * (high_value - low_value) ),
              goal_low: parseFloat( (low_value + (mod_ranges[modifier].sm * (high_value - low_value) ) ) ),
              goal_high: parseFloat( (high_value + (mod_ranges[modifier].lg * (high_value - low_value) ) ) ),
              mod_sm: mod_ranges[modifier].sm,
              mod_lg: mod_ranges[modifier].lg,
            });
          
            let low_range_val = parseFloat( (low_value + (mod_ranges[modifier].sm * (high_value - low_value) ) ) * lbm );
            let high_range_val = parseFloat( (low_value + (mod_ranges[modifier].lg * (high_value - low_value) ) ) * lbm );

            let solution = {
                low_range_val: low_range_val,
                high_range_val: high_range_val,
                avg_range_val: (low_range_val + high_range_val) / 2,
            };

            return solution;
        }
  
    // Core Function: Nutrition Calculator 1.0
        function NutriCalc(form_data, goals, custom_range) {    

            // Define Custom Range Selectors 
                let mod_cals = $(form_data.calories).val();
                let mod_carb = $(form_data.carbs).val();
                let mod_prot = $(form_data.protein).val();

            // Define Lean Body Mass
                let lbm = $(form_data.body_weight).val() * (1 - ($(form_data.body_fat).val() / 100) );
          
            // Define Minimum Fat
                let min_fat = lbm * 0.4;

            // If 'goals' equals false: then use custom values from form
                if(goals === false) {
                  var low_cals_val = parseFloat($(custom_range.cals_low).val());
                  var high_cals_val = parseFloat($(custom_range.cals_high).val());
                  var low_carb_val = parseFloat($(custom_range.carb_low).val());
                  var high_carb_val = parseFloat($(custom_range.carb_high).val());
                  var low_prot_val = parseFloat($(custom_range.prot_low).val());
                  var high_prot_val = parseFloat($(custom_range.prot_high).val());
            // Else: search the 'goals' object and return the data object that matches its val ( goals[g].val )
                } else {
                  var goal_selected = $(form_data.nutrition_goal).val();
                  var count_goals = goals.length;
                  var set_active_goal;
                  // Loop through goals object array until the nth goal value equals the selected goal
                  // Once found, set the active goal to the child object's contents, then break the for loop
                  for(g = 0; g < count_goals; g++) {
                    if(goals[g].val == goal_selected) {set_active_goal = goals[g]; break;}
                  }

                  var low_cals_val = parseFloat(set_active_goal.data.cals_low);
                  var high_cals_val = parseFloat(set_active_goal.data.cals_high);
                  var low_carb_val = parseFloat(set_active_goal.data.carb_low);
                  var high_carb_val = parseFloat(set_active_goal.data.carb_high);
                  var low_prot_val = parseFloat(set_active_goal.data.prot_low);
                  var high_prot_val = parseFloat(set_active_goal.data.prot_high);
                }

            // Calculate Range: Calorie Data
                let result_cals = CalculateRange(mod_cals, low_cals_val, high_cals_val, lbm);

            // Calculate Range: Carb Data
                let result_carb = CalculateRange(mod_carb, low_carb_val, high_carb_val, lbm);

            // Calculate Range: Protein Data
                let result_prot = CalculateRange(mod_prot, low_prot_val, high_prot_val, lbm);

            // Logically Deduce Fat From Other Nutrient Totlas
            // fat_low_range_val, fat_high_range_val, and results_fat mimics and bypasses the CalculateRange function
                let fat_low_range_val = ( ( parseFloat(result_cals.low_range_val) - (parseFloat(result_carb.low_range_val) * 4) - (parseFloat(result_prot.low_range_val) * 4) ) / 9);

                let fat_high_range_val = ( ( parseFloat(result_cals.high_range_val) - (parseFloat(result_carb.high_range_val) * 4) - (parseFloat(result_prot.high_range_val) * 4) ) / 9 );

                let result_fats = {
                    low_range_val: fat_low_range_val,
                    high_range_val: fat_high_range_val,
                    avg_range_val: (fat_low_range_val + fat_high_range_val) / 2,
                };


            // Define Results Object Returned from Function
                let results_object = {
                  calories: result_cals,
                  carbs: result_carb,
                  protein: result_prot,
                  fat: result_fats,
                  min_fat: min_fat,
                };
          
            // Console Log
                console.log({
                  form_data: form_data,
                  custom_range: custom_range,
                  goals: goals,
                  lbm: lbm,
                  results_object: results_object,
                });

            return results_object;
        }

    // Function: Append the results to the results table
        function AppendResults(results, results_map) {
            let rm = results_map;
            // Clear Table Fields
                $(rm.r_cal_low, 
                  rm.r_cal_high, 
                  rm.r_cal_avg, 
                  rm.r_carb_low, 
                  rm.r_carb_high, 
                  rm.r_carb_avg, 
                  rm.r_prot_low, 
                  rm.r_prot_high, 
                  rm.r_prot_avg, 
                  rm.r_fats_low, 
                  rm.r_fats_high, 
                  rm.r_fats_avg).text('');

            // Append Calories Data
                $(rm.r_cals_low).text(results.calories.low_range_val.toFixed(0));
                $(rm.r_cals_high).text(results.calories.high_range_val.toFixed(0));
                $(rm.r_cals_avg).text(results.calories.avg_range_val.toFixed(0))
                $(rm.r_cals_pct).text( ((results.calories.low_range_val / results.calories.low_range_val) * 100).toFixed(0) + '%' );
            // Append Carbohydrate Data
                $(rm.r_carb_low).text(results.carbs.low_range_val.toFixed(0) + 'g');
                $(rm.r_carb_high).text(results.carbs.high_range_val.toFixed(0) + 'g');
                $(rm.r_carb_avg).text(results.carbs.avg_range_val.toFixed(0) + 'g')
                $(rm.r_carb_pct).text( ( ((results.carbs.low_range_val * 4) / results.calories.low_range_val) * 100).toFixed(0) + '%');
            // Append Protein Data    
                $(rm.r_prot_low).text(results.protein.low_range_val.toFixed(0) + 'g');
                $(rm.r_prot_high).text(results.protein.high_range_val.toFixed(0) + 'g');
                $(rm.r_prot_avg).text(results.protein.avg_range_val.toFixed(0) + 'g')
                $(rm.r_prot_pct).text( ( ((results.protein.low_range_val * 4) / results.calories.low_range_val) * 100).toFixed(0) + '%');
            // Append Fat Data    
                $(rm.r_fats_low).text(results.fat.low_range_val.toFixed(0) + 'g');
                $(rm.r_fats_high).text(results.fat.high_range_val.toFixed(0) + 'g');
                $(rm.r_fats_avg).text(results.fat.avg_range_val.toFixed(0) + 'g')
                $(rm.r_fats_pct).text( ( ((results.fat.low_range_val * 9) / results.calories.low_range_val) * 100).toFixed(0) + '%');
        }
  
      // Handle Minimum Fat Warning
      function MinimumFatWarning(warning_catcher, lowest_fat, minimum_fat) {
          if(lowest_fat < minimum_fat) {
                  
                  console.log('fat is toooooo low');
                  $(warning_catcher).append('<div class="alert alert-danger">Minimum recommended fat is '+minimum_fat.toFixed(0)+'g.');
          }
      }
  
    // Operate Nutrition Calculator 1.0
        $(submit_id).on('click', function(e) {
            e.preventDefault();
            console.log({active_goal: $('#nc-goal').val() });

            // If: the Goal select/option value is 'custom' then set 'goals' to false so that the custom data (6 fields) may be used instead
            // Else: Allow the 'goals' data to be used based on the goal selected
            $('#nc-goal').val() == 'custom' ? goals = false : goals = goals;

            let results = NutriCalc(form_data, goals, custom_range);

            console.log({results: results, results_map: results_map});

            AppendResults(results, results_map);
            
            $(warning_catcher).empty();
          
            MinimumFatWarning(warning_catcher, parseFloat(results.fat.low_range_val), parseFloat(results.min_fat));
        });
  
    // Toggle Visibility of Custom input fields
        $('#nc-goal').on('change', function() {
          $(this).val() == 'custom' ? $('#nc-custom-goal-data').removeClass('hidden') : $('#nc-custom-goal-data').addClass('hidden');
        });
});   