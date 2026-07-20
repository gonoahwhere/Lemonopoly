import 'dotenv/config';

const required = (key) => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing required environment variable: ${key}`);
    return value;
}

const isDev = process.env.VERSION === 'dev';

const emojis = {
    leaderboard: {
        bronze: '1523568636156182558',
        silver: '1523568638576033863',
        gold: '1523568637301096478',
        '01': '1523582308706156646',
        '02': '1523582307531751595',
        '03': '1523582306399424602',
        '04': '1523582286036078652',
        '05': '1523582271079190568',
        '06': '1523582171707609158',
        '07': '1523582170071830579',
        '08': '1523582168381784146',
        '09': '1523582167131619419',
        '10': '1523582165806219285',
    },
    ingredients: {
        base: {
            water: '1523556395419435018',
            white_sugar: '1523556394115268718',
            lemon: '1523556391904874496',
            ice: '1523556390742917230',
        },
        fruit: {
            lime: '1523773560886263848',
            orange: '1523774294042218546',
            strawberry: '1523775250859557016',
            raspberry: '1523774758427295934',
            blackberry: '1523771546513178634',
            blueberry: '1523771548022870196',
            cherry: '1523772131480043582',
            mango: '1523773563537199104',
            pineapple: '1523774752550813857',
            watermelon: '1523775257599541368',
            grape: '1523773074649120999',
            green_apple: '1523773076876034149',
            red_apple: '1523774759660421301',
            kiwi: '1523773556436242473',
            passionfruit: '1523774298664472617',
            dragonfruit: '1523772485886148748',
            coconut: '1523772474171457638',
            banana: '1523771541609775206',
            pomegranate: '1523774753977139363',
            cranberry: '1523772479636770876',
        },
        sweeteners: {
            brown_sugar: '1523771549658775562',
            honey: '1523773089207287958',
            maple_syrup: '1523773567257542787',
            agave: '1523772127290069132',
            stevia: '1523775249710317689',
            vanilla_syrup: '1523775255951446107',
            caramel_syrup: '1523772128808272004',

        },
        herbs: {
            sage: '1523774762109894657',
            thyme: '1523775251832635545',
            lavender: '1523773558528934092',
            rosemary: '1523774760771780739',
            basil: '1523771543736418394',
            mint: '1523774287759151124',
        },
        spices: {
            vanilla: '1523775254252621904',
            nutmeg: '1523774290539974706',
            cinnamon: '1523772471151693854',
            cardamom: '1523772130188066826',
            cloves: '1523772472560980119',
            ginger: '1523773069754368100',
        },
        drinks: {
            sparkling_water: '1523775248451764487',
            green_tea: '1523773078180593745',
            hibiscus_tea: '1523773080537661631',
            oat_milk: '1523774291991203900',
            coconut_water: '1523772475865960710',
            black_tea: '1523771544621420710',
            peach_tea: '1523774300539064543',
            coffee: '1523772477568712724',
            cream: '1523772481909952632',
            almond_milk: '1523771540318191727',
            milk: '1523773574320488639',
        },
        garnishes: {
            umbrella: '1523775252969160838',
            candy: '1523771551307006133',
            mint_leaf: '1523774288853995530',
            lime_slice: '1523773561976787076',
            lemon_slice: '1523773559766515923',
            orange_slice: '1523774295556358395',
            maraschino_cherry: '1523773569144848464',
            whipped_cream: '1523775259495366656',
        },
        premium: {
            premium_sugar: '1523774755361128591',
            rainbow_syrup: '1523774757261017099',
            aged_vanilla: '1523771538829213838',
            wild_honey: '1523775260787478589',
            organic_lemon: '1523774297317839001',
            diamond_ice: '1523772484472672338',
            edible_glitter: '1523772486540460114',
            gold_leaf: '1523773073222926466',
        },
        event: {
            pumpkin: '1523774756325949663',
            peppermint: '1523774302212722869',
            candy_cane: '1523771552951173263',
            snowflake_ice: '1523774763355340883',
            gingerbread: '1523773070869921822',
            chocolate: '1523772132780151089',
            marshmallow: '1523773573087498271',
            heart_sprinkles: '1523773079375839342',
            firework_powder: '1523773068542214184',
        },
        pride: {
            rainbow_sprinkles: '1524582179575828550',
            pride_confetti: '1524582178275463299',
            prism_dust: '1524582177092927630'
        }
    },
    currency: {
        cash: '1523558886714380328',
        coins: '1523558882247573636',
    },
    stand: {
        recipe: '1523558887792447498',
        location: '1523562275305427086',
        heart: '1524583738401620210',
        level: '1524618274694893589',
        appeal: '1524583544020795553',
        resilience: '1524583545299800167',
        storage: '1524583547409797282',
        speed: '1524583546310754314',
        prestige: '1524617686221328405',
    },
    misc: {
        cooldown: '1523570665440153621',
        reply: '1523571677898739843',
        replyagain: '1523571676858814655',
        enabled: '1523570663841988689',
        disabled: '1523570666916548650',
        warning: '1523567058829312121',
        info: '1523567057658974208',
        left_arrow: '1523708486490394785',
        right_arrow: '1523708488356724776',
    },
    config: {
        autoserve: '1524582437361946865',
        beta: '1524582438976618657',
        leaderboard: '1524582440021004590',
        mix_all: '1524582441040482586',
        notifications: '1524582442483056660',
        premium: '1524582447839187145',
        seasonal: '1524582448955002940',
        timezone: '1524582450758549554',
    }
};

export default { 
    version: process.env.VERSION,
    token: isDev ? process.env.DEV_TOKEN : process.env.MAIN_TOKEN,
    clientId: isDev ? process.env.DEV_CLIENT_ID : process.env.MAIN_CLIENT_ID,
    guildId: process.env.GUILD_ID ?? null,
    MongoURI: process.env.MONGO_URI ?? null,

    sharding: {
        totalShards: 'auto',
        shardsPerCluster: 4,
    },

    defaultCooldown: 5,

    botid: '1523419467240177735',
    settings: {
        prefix: '/',
        ver: '1.0.0',
        dob: '5th July 2026',
    },
    owners: {
        noah: {
            tag: 'gonoahwhere',
            id: '372456601266683914'
        },
        null: {
            tag: 'null8626',
            id: '661200758510977084'
        },
        lucas: {
            tag: 'megan01life',
            id: '269904947578011649'
        },
        demon: {
            tag: 'demondev_',
            id: '555652788592443392'
        },
    },
    containers: {
        footer: 'Monopolizing childhood memories.',
        color: '#FFF4A3',
    },

    emoji: (...path) => `<:${path[path.length - 1]}:${path.reduce((acc, name) => acc[name], emojis)}>`,
    emojis
}