/**
 * 针对mix Class实现的jasmine测试用例，五组测试用例分别针对: 1.简单Class创建；2.继承情况下的Class创建；3.extend功能;4.Implements功能;5.转化普通构造函数 进行了测试。
 * 用例校验方式: 配置HttpServer, 访问 ./runner.html 页面
 */
define(function(require) {

    var Class = require('../src/class');

    describe('mix Class test', function() {
		var tmp = {};

		//测试非继承时的Class创建(仅传入properties)
		test("Simple Class Create",function(){
			var Vehicle = Class.create({
				initialize:function(speed){
					this.speed = speed;
				},
				isOverspeed:function(testSpeed){
					return testSpeed > this.speed ? true :false;
				}
			});
			var vehicle = new Vehicle(120);
			expect(vehicle.speed).toBeDefined(); //保证 initialize 方法被正确执行
			expect(vehicle.isOverspeed(240)).toBeTruthy(); 
			expect(vehicle.isOverspeed(40)).not.toBeTruthy(); //保证对象属性方法工作正常
			tmp.Vehicle = Vehicle;
		});

		//测试继承情况下的Class创建
		test("Advanced Class Create",function(){
			var Car = Class.create(tmp.Vehicle,{
				setDoorNum:function(doorNum){
					this.doorNum = doorNum;
				}
			});

			var car = new Car(140);
			expect(Car.superclass.isOverspeed).toBeDefined(); //保证superclass能访问
			expect(car.speed).toEqual(140); //保证继承成功
			car.setDoorNum(4);
			expect(car.doorNum).toBeDefined(); //保证混入成功
			tmp.Car = Car;
		});

		//测试extend
		test("Class extend",function(){
			var Vehicle = tmp.Vehicle;
			var Moto = Vehicle.extend({
				setWheelNum:function(wheelNum){
					this.wheelNum = wheelNum;
				}
			});
			var moto = new Moto(80);
			expect(moto.speed).toEqual(80); //保证继承成功
			expect(moto.setWheelNum).toBeDefined();//保证扩展成功
			tmp.Moto = Moto;
		});

		//测试Implements工作正常
		test("Implements works",function(){
			var MotoWithDoor = tmp.Vehicle.extend({
				Implements:[tmp.Car,tmp.Moto]
			});
			var motoCar = new MotoWithDoor(80);
			expect(motoCar.setDoorNum).toBeDefined(); // setDoorNum 和  setWheelNum 分别是 Car 和Moto的方法，如果它们被成功混入，则代表Implements机制工作正常
			expect(motoCar.setWheelNum).toBeDefined();
		});

		//测试转换普通构造函数转换为Class类工作正常
		test("Class Generate works",function(){
			function Oldschool(){
				this.age = 98;
			}

			Oldschool.prototype.getAge = function(){
				return this.age;
			};
			var NewOne = Class(Oldschool);
			var Youth = NewOne.extend({
				saySomething:function(){
					return "i don't believe my age is " + this.getAge() ;
				}
			});
			var youth = new Youth();
			expect(youth.saySomething()).toEqual("i don't believe my age is 98"); 
		});

    });

});

