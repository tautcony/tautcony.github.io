let quotes = [
    {
        org: "Was ist schlecht? - Alles, was aus der Schwäche stammt.",
        jpn: "悪とは何か──弱さから生ずるすべてのものだ。",
        chi: "何謂惡──即一切源自於軟弱之物。",
        aut: "Friedrich Wilhelm Nietzsche",
        sou: "Der Antichrist",
    },
    {
        org: "C'est une grande habileté que de savoir cacher son habileté.",
        jpn: "才能を隠すのにも卓越した才能がいる。",
        chi: "要隱藏天分也需要卓越的天分。",
        aut: "François VI, duc de La Rochefoucauld",
        sou: "Réflexions ou sentences et maximes morales",
    },
    {
        org: "Man is an only animal that makes bargains: no dog exchanges bones with another.",
        jpn: "人間は取引をする唯一の動物である。骨を交換する犬はいない。",
        chi: "人類是唯一會交易的動物。沒有狗會交換骨頭",
        aut: "Adam Smith",
        sou: "The Wealth of Nations",
    },
    {
        org: "Il ne faut pas s'offenser que les autres nous chachent la vérité.\npuisque nous nous la cachons si souvent à nous-mêmes.",
        jpn: "他人が真実を隠蔽することに対して、我々は怒るべきでない。\nなぜなら、我々も自身から真実を隠蔽するのであるから。",
        chi: "他人隱瞞真相，我們不應當發怒。\n因為我們自己也會隱瞞真相。",
        aut: "François VI, duc de La Rochefoucauld",
        sou: "Réflexions ou sentences et maximes morales",
    },
    {
        org: "l'enfer, c'est les autres.",
        jpn: "地獄、それは他人である。",
        chi: "他人即地獄",
        aut: "Jean-Paul Sartre",
        sou: "Huis clos",
    },
    {
        org: "Il y a deux sortes de mensonges: celui de fait qui regarde le passé, celui de droit qui regarde l' avenir.",
        jpn: "嘘には二種類ある。\n過去に関する事実上の嘘と未来に関する権利上の嘘である。",
        chi: "謊言分為兩種。\n與過去相關的事實上的謊言與未來相關的權利上的謊言。",
        aut: "Jean-Jacques Rousseau",
        sou: "Émile: ou De l'éducation",
    },
    {
        org: "Rein n'est si dangereux qu'un ignorant ami ;Mieux vaudrait un sage ennemi.",
        jpn: "無知な友人ほど危険なものはない。\n賢い敵のほうがよっぽどましだ。",
        chi: "寧可有聰明的敵人也不要有無知的朋友。",
        aut: "Jean de La Fontaine",
        sou: "Fables choisies",
    },
    {
        org: "Lasciate ogni speranza, voi ch'entrate.",
        jpn: "汝等ここに入るもの、一切の望みを捨てよ。",
        chi: "進入此地者，當捨棄一切希望。",
        aut: "Dante Alighieri",
        sou: "Divina Commedia",
    },
    {
        org: "L'homme est condamné à être libre.",
        jpn: "人間は自由の刑に処されている。",
        chi: "人類被處以自由之刑。",
        aut: "Jean-Paul Sartre",
        sou: "L'existentialisme est un humanisme",
    },
    {
        org: "Den farligste Forræder blandt alle er den, ethvert Menneske har i sig selv.",
        jpn: "裏切者の中で最も危険なる裏切者は何かといえば、すべての人間が己れ自身の内部にかくしているところのものである。",
        chi: "背叛者中最危險的背叛者是將所有人藏於已身者。",
        aut: "Søren Aabye Kierkegaard",
        sou: "Kjerlighedens Gjerninger",
    },
    {
        org: "Was aber die Leute gemeiniglich das Shicksal nennen sind meistens nur ihre eigenen dummen Streiche.",
        jpn: "しかし、概して人々が運命と呼ぶものは、大半が自分の愚行にすぎない。",
        chi: "然而，基本上人們稱之為命運的大多只是自己的愚行。",
        aut: "Arthur Schopenhauer",
        sou: "Parerga und Paralipomena",
    },
    {
        org: "Das Genie wohnt nur eine Etage höher als der Wahnsinn.",
        jpn: "天才とは、狂気よりも1階層分だけ上に住んでいる者のことである。",
        chi: "所謂的天才，指的是比瘋狂更上一層的人。",
        aut: "Arthur Schopenhauer",
        sou: "Parerga und Paralipomena",
    },
];

interface Info {
    tag: string;
    className?: string;
    style?: string;
    content: string;
}

let CreateElement = (info: Info) => {
    const className = info.className !== undefined ? `class="${info.className}"` : "";
    const style = info.style !== undefined ? `style="${info.style}"` : "";
    return `<${info.tag} ${className} ${style} >${info.content}</${info.tag}>`;
};

$(document).ready(() => {
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    const text = [quote.chi, quote.jpn][Math.floor(Math.random() * 2)];
    const quoteDiv = CreateElement({
        tag: "div",
        style: "margin-top:4em;margin-bottom:-2em;",
        content: text,
    });
    const authorDiv = CreateElement({
        tag: "small",
        style: "margin-left:16em;",
        content: quote.aut,
    });
    $(".copyright").append(`<br/>${quoteDiv}<br/>${authorDiv}`);
});
