function testModel() {
	var data1 = {
			'L1_1': 1,
			'L1_2': '1',
			'L1_3': {
				'L2_1': 2,
				'L2_2': '2',
				'L2_3': {
					'L3_1': 3,
					'L3_2': '3'
				}
			},
			'L1_4': {
				'L2_4': '4',
				'L2_5': {
					'L3_3': '5',
					'L3_4': '6'
				}
			}
		},
		data2 = {
			a: 1,
			b: 2
		},
		model = new app.module.Model(data1),
		collection = new app.module.Collection([data2, 3, [4,5,6]])
		;

	log('============== test model =================');

	log(model['L1_1']);
	log(model['L1_2']);
	log(model['L1_3']['L2_1']);
	log(model['L1_3']['L2_2']);
	log(model['L1_3']['L2_3']['L3_1']);
	log(model['L1_3']['L2_3']['L3_2']);
	log(model['L1_4']['L2_4']);
	log(model['L1_4']['L2_5']['L3_3']);
	log(model['L1_4']['L2_5']['L3_4']);

	model['L1_1'] = 11;
	model['L1_2'] = {
		'L2_0': 20
	}
	log(model['L1_1']);
	log(model['L1_2']['L2_0']);

	model['L1_3']['L2_1'] = 21;
	model['L1_3']['L2_2'] = '21';
	log(model['L1_3']['L2_1']);
	log(model['L1_3']['L2_2']);

	model['L1_3']['L2_3']['L3_1'] = 31;
	model['L1_3']['L2_3']['L3_2'] = '32';
	log(model['L1_3']['L2_3']['L3_1']);
	log(model['L1_3']['L2_3']['L3_2']);


	model['L1_4']['L2_4'] = {
		'L3_5': 35,
	}
	model['L1_4']['L2_5']['L3_3'] = '33';
	model['L1_4']['L2_5']['L3_4'] = '34';

	log(model['L1_4']['L2_4']['L3_5']);
	log(model['L1_4']['L2_5']['L3_3']);
	log(model['L1_4']['L2_5']['L3_4']);

	log(model['L1_5']);
	model.update({
		'L1_5':{
			'L2_6': 26
		}
	});
	log(model['L1_5']['L2_6']);


	log('============== test collection =================');
	log(collection[0].a);
	log(collection[0].b);
	log(collection[1]);
	log(collection[2][0]);
	log(collection[2][1]);
	log(collection[2][2]);

	collection.push(4);
	log(collection[3]);
	log(collection.pop());

	collection[2][0] = 20;
	collection[2][1] = 21;
	collection[2][2] = 22;

	log(collection[2][0]);
	log(collection[2][1]);
	log(collection[2][2]);
}