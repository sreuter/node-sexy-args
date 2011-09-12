var equal = require('assert').equal,
    Parser = require('../lib/parser').Parser,
    puts = require('sys').puts,
    sexy = require('../lib/index')
    
exports.tests = {
    'should properly determine the position of each argument based on the argument descriptions.': function(finished, prefix) {
        var argumentDescriptions = [
            [
                'string1',
                'object1',
                'function1'
            ],
            [
                'object1',
                'function1'
            ],
            'function1'
        ];
            
        (function(foo, options, callback) {
            var parser = new Parser();
            
            parser.run(this, arguments, argumentDescriptions, function() {});
            parser._createArgumentsToApplyObject();
            equal(0, parser.argumentsToApply.string1.index, prefix + 'string argument not in proper position');
            equal(1, parser.argumentsToApply.object1.index, prefix + 'object argument not in proper position');
            equal(2, parser.argumentsToApply.function1.index, prefix + 'function argument not in proper position');
            finished();
        })();
    },

    'should invoke the callback with the proper arguments when a parser is created': function(finished, prefix) {
        (function(foo, bar) {
            sexy.args([this, 'string1', 'string2'], {}, function() {
                equal('bar', foo, prefix + 'foo was not equal to bar');
                equal('foo', bar,  prefix + 'bar was not equal to foo');
                finished();
            });
        })('bar', 'foo');
        
        (function(foo, bar) {
            sexy.args([this], {}, function() {
                equal('bar', foo, prefix + 'foo was not equal to bar');
                equal('foo', bar,  prefix + 'bar was not equal to foo');
                finished();
            });
        })('bar', 'foo');
    },

    'should return an error in the callback when the arguments fail to parse': function(finished, prefix) {
        (function(foo, bar) {
            var error = null;
            try {
                sexy.args([this, 'string1', 'string2'], function() {});
            } catch (err) {
                error = err;
            }
            equal("sexy-args.Parser: could not parse argument 0. typeof(string1) should be 'string' was number", error.message, prefix + 'unexpected error message');
        })(10, 'foo');
        
        finished();
    },

    'should invoke the function with the proper arguments when a single or statement is used.': function(finished, prefix) {
        var argumentsDescription = [this, ['string1', 'number1'], 'number1'];
        (function(foo, bar) {
            sexy.args(argumentsDescription, function() {
                equal(30, bar, prefix + 'bar should equal 30');
            });
        })(30);
        
        (function(foo, bar) {
            sexy.args(argumentsDescription, function() {
                equal('hey', foo, prefix + 'foo should equal hey');
            });
        })('hey');
        
        (function(foo, bar) {
            sexy.args(argumentsDescription, function() {
                equal('bar', foo, prefix + 'foo should equal bar');
                equal(30, bar, prefix + 'bar should equal 30');
                finished();
            });
        })('bar', 30);
    },

    'should invoke the function with the proper arguments when two or statements are used.': function(finished, prefix) {
        var argumentsDescription = [this, ['string1', 'number1', 'function1'], ['number1', 'function1'], 'function1'];
        (function(foo, bar, callback) {
            sexy.args(argumentsDescription, function() {
                equal('function', typeof(callback), prefix + 'object.foo should equal bar');
                equal(30, bar, prefix + 'bar should equal 30');
            });
        })(30, function() {});
        
        (function(foo, bar, callback) {
            sexy.args(argumentsDescription, function() {
                equal('hey', foo, prefix + 'foo should equal hey');
                equal('function', typeof(callback), prefix + 'callback should be a function');
                equal(30, bar, prefix + 'bar should equal 30');
            });
        })('hey', 30, function() {});
        
        (function(foo, bar, callback) {
            sexy.args(argumentsDescription, function() {
                equal('hey', foo, prefix + 'foo should equal hey');
            });
        })('hey');
        
        (function(foo, bar, callback) {
            sexy.args(argumentsDescription, function() {
                equal('hey', foo, prefix + 'foo should equal hey');
                equal('function', typeof(callback), prefix + 'callback should be a function');
                finished();
            });
        })('hey', function() {});
    },
    
    'should populate an error when an or statement fails to parse': function(finished, prefix) {
        var argumentsDescription = [this, ['string1', 'number1', 'function1'], ['number1', 'function1'], 'function1'];
        (function(foo, bar, callback) {
            var error = null;
            try {
                sexy.args(argumentsDescription, function(err) {});
            } catch (err) {
                error = err;
            }
            equal("sexy-args.Parser: could not parse argument 0. 'or' statement failed to evaluate.", error.message, prefix + 'unexpected error message');
        })(new Error(), function() {});
        finished();
    },
    
    'should maintain extra arguments when invoked with them': function(finished, prefix) {
        (function(foo, bar) {
            sexy.args([this, 'string1', 'string2'], {}, function() {
                equal('a', foo, prefix + 'foo was not equal to bar');
                equal('b', bar,  prefix + 'bar was not equal to foo');
                equal(arguments[2], 'c', prefix + 'extra argument not populated');
                equal(arguments[3], 'd', prefix + 'extra argument not populated');
                finished();
            });
        })('a', 'b', 'c', 'd');
    },
    
    'should allow for array types': function(finished, prefix) {
        var argumentsDescription = [this, 'array1'];
        (function(foo) {
            var error = null;
            try {
                sexy.args(argumentsDescription, function() {});
            } catch (err) {
                error = err;
            }
            equal("sexy-args.Parser: could not parse argument 0. typeof(array1) should be 'array' was string", error.message, prefix + 'unexected error message');
        })('not an array');
        
        (function(foo) {
            var error = null;
            try {
                sexy.args(argumentsDescription, function() {
                    equal('hey', foo.pop(), prefix + 'array not properly populated');
                });
            } catch (err) {
                error = err;
            }
            equal(null, error, prefix + 'error was not null');
        })(['hey']);

        finished();
    },
    
    'should initialize types with sane default values': function(finished, prefix) {
        (function(object, array, fn) {
            sexy.args([this, 'object1', 'array1', 'function1'], {}, function() {
                equal('{}', JSON.stringify(object), 'object did not have proper default value');
                equal('[]', JSON.stringify(array), 'array did not have proper default value');
                equal('function', typeof(fn), 'function did not have proper default value');
                finished();
            });
        })();
    },
    
    'when closure is invoked it should have the scope of the object outside of sexy-args': function(finished, prefix) {
        function Person(attributes) {
            sexy.args([this, 'object1'], function() {
                Parser.prototype._extend(this, attributes);
            });
        };

        var ben = new Person({
            name: 'Benjamin',
            age: 27
        });
        
        equal('Benjamin', ben.name, "Ben's name was not set.");
    }
}