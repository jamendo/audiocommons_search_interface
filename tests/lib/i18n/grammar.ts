import { test, suite } from 'mocha-typescript';
import { assert } from 'lib/utils/assert';
import { list } from 'lib/i18n/grammar';


@suite class I18nGrammar {
	@test 'list: 0 items'() {
		assert(list() === '');
	}

	@test 'list: filter non-string items'() {
		assert(list(<any>1, <any>NaN, <any>Infinity, <any>{}, <any>[], <any>(() => ''), <any>true, undefined!, null!) === '');
	}

	@test 'list: filter 1 empty string item'() {
		assert(list('') === '');
	}

	@test 'list: filter 1 empty string item #2'() {
		assert(list(' ') === '');
	}

	@test 'list: 1 items'() {
		assert(list('one') === 'one');
	}

	@test 'list: 2 items'() {
		assert(list('one', 'two') === 'one and two');
	}

	@test 'list: 3 items'() {
		assert(list('one', 'two', 'three') === 'one, two and three');
	}

	@test 'list: 2 items, 1 empty string item'() {
		assert(list('one', '', 'two') === 'one and two');
	}

	@test 'list: 2 items, 1 empty string item #2'() {
		assert(list('one', '	', 'two') === 'one and two');
	}

	@test 'list: upper/lowercase'() {
		assert(list('One', 'tWo', 'THREE') === 'One, tWo and THREE');
	}

	@test 'list: whitespace trim'() {
		assert(list('one ', ' two ', ' three') === 'one, two and three');
	}
}
