import { DiffPatcher } from "jsondiffpatch";

const jsondiffpatch = new DiffPatcher();

sample1();
sample2();

declare var console: {
    log(value: any): void;
};

function sample1() {
    // sample data
    var country = {
        name: "Argentina",
        capital: "Buenos Aires",
        independence: new Date(1816, 6, 9),
        unasur: true
    };

    // clone country, using dateReviver for Date objects
    var country2 = JSON.parse(JSON.stringify(country), jsondiffpatch.dateReviver);

    // make some changes
    country2.name = "Republica Argentina";
    country2.population = 41324992;
    delete country2.capital;
    var delta = jsondiffpatch.diff(country, country2);

    // old value, new value
    delta.name[0] = "Argentina";
    delta.name[1] = "Republica Argentina";

    delta.population[0] = "41324992"; // new value

    // patch original
    var patched = jsondiffpatch.patch(country, delta);
    console.log(patched.name === "Republica Argentina");

    // reverse diff
    var reverseDelta = jsondiffpatch.reverse(delta);
    var reversePatched = jsondiffpatch.patch(country2, reverseDelta);
    console.log(reversePatched.name === "Argentina");

    // also country2 can be return to original value with: jsondiffpatch.unpatch(country2, delta);
    var unpatched = jsondiffpatch.unpatch(country2, delta);
    console.log(unpatched.name === "Argentina");

    var delta2 = jsondiffpatch.diff(country, jsondiffpatch.clone(country));
    // undefined => no difference
    console.log(delta2 === undefined);
}

function sample2() {
    // sample data
    var country = {
        name: "Argentina",
        cities: [
            {
                name: 'Buenos Aires',
                population: 13028000,
            },
            {
                name: 'Cordoba',
                population: 1430023,
            },
            {
                name: 'Rosario',
                population: 1136286,
            },
            {
                name: 'Mendoza',
                population: 901126,
            },
            {
                name: 'San Miguel de Tucuman',
                population: 800000,
            }
        ]
    };

    // clone country
    var country2 = JSON.parse(JSON.stringify(country));

    // delete Cordoba
    country.cities.splice(1, 1);

    // add La Plata
    country.cities.splice(4, 0, {
        name: 'La Plata',
        population: 800000,
    });

    // modify Rosario, and move it
    var rosario = country.cities.splice(1, 1)[0];
    rosario.population += 1234;
    country.cities.push(rosario);

    // create a configured instance, match objects by name
    var diffpatcher = new DiffPatcher({
        objectHash: function (obj: any) {
            return obj.name;
        }
    });

    var delta = diffpatcher.diff(country, country2);

    console.log(delta.cities._t == "a");
    console.log(delta.cities[1][0].name === "Cordoba");
}
