const M = ((
	Module = {of: (f, ...args) => f.apply(undefined, args)},
	Objects = {
		withField: (object, key, value) => {
			object[key] = value;
			return object;},
		withFields: (object, fieldKeyValues) => {
			Object.entries(fieldKeyValues).forEach(fieldKeyValue => object[fieldKeyValue[0]] = fieldKeyValue[1]);
			return object;}},
	Numbers = {
		range: (fromInclusive, toExclusive) => {
			let range = [];
			for(let i = fromInclusive; i < toExclusive; ++i) {
				range.push(i);}
			return range;},
		clampLower: (value, fromInclusive) => value < fromInclusive ? fromInclusive : value,
		clampUpper: (value, toInclusive) => value > toInclusive ? toInclusive : value,
		clamp: (value, fromInclusive, toInclusive) =>
			value < fromInclusive ? fromInclusive :
				value > toInclusive ? toInclusive :
					value,
		randomIntegerInRange: (fromInclusive, toInclusive) =>
			Math.floor(Math.random() * (1 + toInclusive - fromInclusive) + fromInclusive)},
	Tuple=Module.of((
		Tuple={
			insert: (A, x, i=A.length) => {
				let C = A.slice();
				C.splice(i, 0, x);
				return C;},
			remove: (A, i) => {
				A.splice(i, 1);
				return A;},
			sublist: (A, fromInclusive, toExclusive) => A.slice(fromInclusive, toExclusive)},
		tuple2=Tuple=Objects.withFields(Tuple, {
			size: x => x.length,
			contains: (A, x) => A.indexOf(x) >= 0,
			indicesOf: (A, x) => A.reduce((I, a, i) => x === A[i] ? Tuple.insert(I, i) : I, []),
			frequency: (A, x) => A.reduce((count, y) => x === y ? count+1 : count, 0),
			insertAll: (A, X, i=A.length) => {
				let C = A.slice();
				C.splice(i, 0, ...X);
				return C;},
			reverse: A => A.reverse(),
			removeFromStart: (A, n) => Tuple.sublist(A, n),
			removeAll: (A, I) => I.reduce((A, i) => Tuple.remove(A, i), A),
			swap: (A, i, j) => {
				[A[i], A[j]] = [A[j], A[i]];
				return A;}})
	) => Objects.withFields(Tuple, {
		isTuple: Array.isArray,
		isEmpty: A => 0 === Tuple.size(A),
		isDistinct: A => undefined === A.find(a => Tuple.frequency(A, a) > 1),
		containsAll: (A, X) => undefined === X.find(x => ! Tuple.contains(A, x)),
		equals: (A, B, areEqual=(x,y) => x===y) => Tuple.size(A) === Tuple.size(B) &&
			undefined === A.find((x, i) => ! areEqual(x, B[i])),
		isSublist: (A, B) => {
			const bSize = Tuple.size(B);
			if(0 === bSize) {
				return true;}
			if(Tuple.size(A) < bSize) {
				return false;}
			const indexStart = A.indexOf(B[0]);
			if(-1 === indexStart) {
				return false;}
			if(1 === bSize) {
				return true;}
			return undefined === Numbers.range(1, bSize).find(i => A[i+indexStart] !== B[i]);},
		indicesOfAll: (A, X) => X.map(x => Tuple.indicesOf(A, x)),
		frequencies: (A, X) => X.map(x => Tuple.frequency(A, x)),
		sort: (A, comparator=(x,y) => x > y ? 1 : x < y ? -1 : 0) => A.sort(comparator),
		swapAll: (A, S) => S.reduce((A, s) => Tuple.swap(A, s[0], s[1]), A),
		insertStart: (A, x) => Tuple.insert(A, x, 0),
		insertStartAll: (A, X) => Tuple.insertAll(A, X, 0),
		insertEnd: (A, x) => Tuple.insert(A, x),
		insertEndAll: (A, X) => Tuple.insertAll(A, X),
		insertAllAt: (A, X, I) => I.reduce((A, i, j) => Tuple.insert(A, X[j], i), A),
		removeElement: (A, x) => Tuple.remove(A, A.indexOf(x)),
		removeElements: (A, X) => Tuple.removeAll(A, X.map(x => A.indexOf(x))),
		removeFromEnd: (A, n) => Tuple.sublist(A, 0, Tuple.size(A) - n + 1),
		sublistByIndices: (A, I) => I.reduce((B, i) => Tuple.insert(B, A[i]), []),
		flatten: (A, depth=1) => A.flat(depth),
		toSet: A => A.reduce(
			(A, a) => {
				const I = Tuple.indicesOf(A, a);
				return 1 === Tuple.size(I) ? A : Tuple.removeAll(A, Tuple.removeFromStart(I, 1));},
			A)})),
	Set=Module.of((
		Set = {
			size: Tuple.size},
		set2=Set=Objects.withFields(Set, {
			equals: (A, B) => Set.size(A) === Set.size(B) && Tuple.containsAll(A, B),
			elementOf: (x, A) => Tuple.contains(A, x),
			union: (A, B) => Tuple.toSet(Tuple.insertAll(A, B)),
			intersection: (A, B) => Tuple.sublistByIndices(A, Tuple.flatten(Tuple.indicesOfAll(A, B))),
			difference: (A, B) => B.reduce((A, b) => Set.elementOf(b, A) ? Tuple.removeElement(A, b) : A, A)
			})
	) => Objects.withFields(Set, {
		isSet: A => Tuple.isTuple(A) && Tuple.isDistinct(A),
		isSubset: (S, A) => undefined === S.find(s => ! Set.elementOf(s, A)),
		isPartition: (P, A) => Tuple.equals(Tuple.flatten(P), A),
		size: Tuple.size,
		isEmpty: Tuple.isEmpty,
		unionAll: L => L.reduce((U, X) => Set.union(U, X), []),
		intersectionAll: L => Tuple.removeFromStart(L, 1).reduce((U, X) => Set.intersection(U, X), L[0]),
		symmetricDifference: (A, B) => Set.difference(Set.union(A, B), Set.intersection(A, B)),
		powerSet: A => A.reduce((P, a) => P.concat(P.map(S => [...S, a])), [[]]),
		cartesianProduct: (A, B) => A.reduce((C, a) => Tuple.insertAll(C, B.map(b => [a, b])), [])}))
) => ({
	Number: Numbers,
	Tuple: Tuple,
	Set: Set}))();