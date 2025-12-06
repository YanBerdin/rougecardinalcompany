  [Passer au contenu principal](https://web.dev/articles/bfcache?hl=fr#main-content)  
 web.dev utilise des cookies Google afin de fournir ses services, d'en améliorer
la qualité et d'analyser le trafic. [En savoir plus sur la manière dont Google utilise les cookies. S'ouvre dans un
autre onglet.](https://policies.google.com/technologies/cookies?hl=fr)

J'ai compris  menu[web.dev](https://web.dev/)     search     light_mode Language [Connexion](https://web.dev/_d/signin?continue=https%3A%2F%2Fweb.dev%2Farticles%2Fbfcache%3Fhl%3Dfr&prompt=select_account)     Cette page a été traduite par l'[API Cloud Translation](https://cloud.google.com/translate/?hl=fr). Switch to English

# Cache amélioré   bookmark_border arrow_drop_down   arrow_drop_down

## Sur cette page

expand_more
[Compatibilité du navigateur](https://web.dev/articles/bfcache?hl=fr#browser-compatibility)
[Principes de base de bfcache](https://web.dev/articles/bfcache?hl=fr#basics)
  [Fonctionnement du cache](https://web.dev/articles/bfcache?hl=fr#how-bfcache-works)
  [Le bfcache et les iFrames](https://web.dev/articles/bfcache?hl=fr#iframes)
  [Le bfcache et les applications monopages (SPA)](https://web.dev/articles/bfcache?hl=fr#spa)
  [API à observer pour bfcache](https://web.dev/articles/bfcache?hl=fr#observe)
[Optimiser vos pages pour bfcache](https://web.dev/articles/bfcache?hl=fr#optimize)
  [Ne jamais utiliser l'événement unload](https://web.dev/articles/bfcache?hl=fr#never-use-the-unload-event)
more_horiz

![Philip Walton](https://web.dev/images/authors/philipwalton.jpg?hl=fr)

Philip Walton [Philip Walton on X](https://twitter.com/philwalton)[Philip Walton on GitHub](https://github.com/philipwalton)[Philip Walton on LinkedIn](https://www.linkedin.com/in/waltonphilip)[Philip Walton on Mastodon](https://toot.cafe/@philipwalton)[Philip Walton on Bluesky](https://bsky.app/profile/philipwalton.com)[Philip Walton's homepage](https://philipwalton.com/)![Barry Pollard](https://web.dev/images/authors/tunetheweb.jpg?hl=fr)

Barry Pollard [Barry Pollard on X](https://twitter.com/tunetheweb)[Barry Pollard on GitHub](https://github.com/tunetheweb)[Barry Pollard on Mastodon](https://webperf.social/@tunetheweb)[Barry Pollard on Bluesky](https://bsky.app/profile/tunetheweb.com)[Barry Pollard's homepage](https://www.tunetheweb.com/)
Le cache amélioré (ou bfcache) est une optimisation de navigateur qui permet de
naviguer instantanément vers les pages précédentes et suivantes. Il améliore
considérablement l'expérience de navigation, en particulier pour les utilisateurs
dont la connexion réseau ou les appareils sont plus lents.

En tant que développeur Web, il est essentiel de comprendre comment [optimiser vos pages pour bfcache](https://web.dev/articles/bfcache?hl=fr#optimize) afin que vos utilisateurs puissent en profiter.

Vous préférez regarder une vidéo plutôt que lire ? Pour obtenir un résumé de ce
qui est présenté sur cette page, regardez cette [vidéo sur les conseils DevTools pour déboguer bfcache](https://youtu.be/Y2IVv5KnrmI).

## Compatibilité du navigateur

Tous les principaux navigateurs incluent un bfcache, y compris Chrome depuis la
version 96, [Firefox](https://developer.mozilla.org/docs/Mozilla/Firefox/Releases/1.5/Using_Firefox_1.5_caching) et [Safari](https://webkit.org/blog/427/webkit-page-cache-i-the-basics/).

## Principes de base de bfcache

Avec le cache "Retour/Avance" (bfcache), au lieu de détruire une page lorsque
l'utilisateur quitte la page, nous retardons la destruction et mettons en pause
l'exécution du code JavaScript. Si l'utilisateur revient rapidement en arrière,
nous rendons la page visible à nouveau et réactivons l'exécution du code
JavaScript. Cela permet une navigation presque instantanée sur les pages pour
l'utilisateur.

Combien de fois avez-vous accédé à un site Web et cliqué sur un lien pour
accéder à une autre page, pour vous rendre compte que ce n'était pas ce que vous
vouliez et cliquer sur le bouton "Retour" ? À ce moment-là, bfcache peut avoir un
impact important sur la vitesse de chargement de la page précédente:

| Sans bfcache activé | Une nouvelle requête est lancée pour charger la page précédente. En fonction de l'optimisation de cette page pour les visites répétées, le navigateur peut être amené à télécharger, à analyser et à exécuter à nouveau certaines (ou toutes) des ressources qu'il vient de télécharger. |
| --- | --- |
| Avec bfcache activé | Le chargement de la page précédente est essentiellement instantané, car l'intégralité de la page peut être restaurée à partir de la mémoire, sans avoir à accéder au réseau. |

Regardez cette vidéo sur le fonctionnement du bfcache pour comprendre
l'accélération qu'il peut apporter aux navigations:

 L'utilisation de bfcache permet de charger les pages beaucoup plus rapidement
lors de la navigation vers les pages précédentes et suivantes.
Dans la vidéo, l'exemple avec bfcache est beaucoup plus rapide que l'exemple
sans lui.

bfcache accélère non seulement la navigation, mais réduit également la
consommation de données, car les ressources n'ont pas besoin d'être téléchargées à
nouveau.

Les données d'utilisation de Chrome montrent qu'une navigation sur 10 sur
ordinateur et une sur cinq sur mobile se font en arrière ou en avant. Avec bfcache
activé, les navigateurs peuvent éliminer le transfert de données et le temps de
chargement pour des milliards de pages Web chaque jour.

### Fonctionnement du cache

Le "cache" utilisé par bfcache est différent du [cache HTTP](https://web.dev/articles/http-cache?hl=fr), qui joue son propre rôle pour accélérer les navigations répétées. bfcache est
un instantané de l'intégralité de la page en mémoire, y compris de la pile
JavaScript, tandis que le cache HTTP ne contient que les réponses aux requêtes
effectuées précédemment. Étant donné qu'il est très rare que toutes les requêtes
requises pour charger une page soient traitées à partir du cache HTTP, les visites
répétées à l'aide de restaurations bfcache sont toujours plus rapides que les
navigations non bfcache les plus optimisées.

Conserver une page pour la réactiver ultérieurement implique une certaine
complexité en termes de meilleure façon de préserver le code en cours. Par exemple,
comment gérez-vous les appels `setTimeout()` où le délai avant expiration est atteint alors que la page se trouve dans le
bfcache ?

La réponse est que les navigateurs suspendent tous les délais en attente ou les
promesses non résolues pour les pages dans le bfcache, y compris presque toutes
les tâches en attente dans les [files d'attente de tâches JavaScript](https://html.spec.whatwg.org/multipage/webappapis.html#task-queue), et reprennent le traitement des tâches si la page est restaurée à partir du
bfcache.

Dans certains cas, comme pour les délais avant expiration et les promesses, le
risque est assez faible, mais dans d'autres, cela peut entraîner un comportement
déroutant ou inattendu. Par exemple, si le navigateur met en pause une tâche
requise dans le cadre d'une [transaction IndexedDB](https://developer.mozilla.org/docs/Web/API/IDBTransaction), cela peut affecter d'autres onglets ouverts de la même origine, car plusieurs
onglets peuvent accéder simultanément aux mêmes bases de données IndexedDB. Par
conséquent, les navigateurs n'essaient généralement pas de mettre en cache les
pages au milieu d'une transaction IndexedDB ni lorsqu'ils utilisent des API
susceptibles d'affecter d'autres pages.

Pour en savoir plus sur l'impact de l'utilisation des différentes API sur
l'éligibilité d'une page à bfcache, consultez [Optimiser vos pages pour bfcache](https://web.dev/articles/bfcache?hl=fr#optimize).

### Le bfcache et les iFrames

Si une page contient des iFrames intégrées, les iFrames elles-mêmes ne sont pas
éligibles au bfcache. Par exemple, si vous accédez à une autre URL dans un
iFrame, le contenu précédent n'est pas ajouté au bfcache. Si vous revenez en arrière,
le navigateur revient en arrière dans l'iFrame plutôt que dans le frame
principal, mais la navigation en arrière dans l'iFrame n'utilise pas le bfcache.

Toutefois, lorsque le frame principal est restauré à partir du bfcache, les
iFrames intégrées sont restaurées telles qu'elles étaient lorsque la page est entrée
dans le bfcache.

Le frame principal peut également être empêché d'utiliser le bfcache si une
iframe intégrée utilise des API qui le bloquent. Pour éviter cela, vous pouvez
utiliser la [règle d'autorisation](https://web.dev/articles/bfcache?hl=fr#permissions-policy) définie sur le frame principal ou les [attributs sandbox](https://developer.mozilla.org/docs/Web/HTML/Element/iframe#sandbox).

### Le bfcache et les applications monopages (SPA)

Comme bfcache fonctionne avec les navigations gérées par le navigateur, il ne
fonctionne pas avec les "navigations douces" dans une application monopage (SPA).
Toutefois, bfcache peut toujours être utile pour revenir à une application SPA
plutôt que de réinitialiser complètement cette application depuis le début.

### API à observer pour bfcache

Bien que le bfcache soit une optimisation effectuée automatiquement par les
navigateurs, il est important que les développeurs sachent quand cela se produit
afin de pouvoir [optimiser leurs pages en conséquence](https://web.dev/articles/bfcache?hl=fr#optimize) et [ajuster les métriques ou les mesures des performances](https://web.dev/articles/bfcache?hl=fr#analytics) en conséquence.

Les principaux événements utilisés pour observer le cache amélioré sont les [événements de transition de page](https://developer.mozilla.org/docs/Web/API/PageTransitionEvent) `pageshow` et `pagehide`, qui sont compatibles avec la [plupart des navigateurs](https://caniuse.com/page-transition-events).

Les nouveaux événements de [cycle de vie de la page](https://developer.chrome.com/blog/page-lifecycle-api?hl=fr) (`freeze` et `resume`) sont également distribués lorsque les pages entrent ou sortent du bfcache,
ainsi que dans d'autres situations, par exemple lorsqu'un onglet en arrière-plan
est gelé pour réduire l'utilisation du processeur. Ces événements ne sont
compatibles qu'avec les navigateurs basés sur Chromium.

#### Observer quand une page est restaurée à partir de bfcache

L'événement `pageshow` se déclenche immédiatement après l'événement `load`, lors du chargement initial de la page et chaque fois que celle-ci est
restaurée à partir du cache amélioré. L'événement `pageshow` comporte une propriété [persisted](https://developer.mozilla.org/docs/Web/API/PageTransitionEvent/persisted), qui est `true` si la page a été restaurée à partir du cache amélioré, et `false` dans le cas contraire. La propriété `persisted` permet de distinguer les chargements de page des restaurations depuis le cache
amélioré. Exemple :

```
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    console.log('This page was restored from the bfcache.');
  } else {
    console.log('This page was loaded normally.');
  }
});

```

Dans les navigateurs compatibles avec l'API Page Lifecycle, l'événement `resume` se déclenche lorsque les pages sont restaurées à partir du cache amélioré
(immédiatement avant l'événement `pageshow`) et lorsqu'un utilisateur revient sur un onglet d'arrière-plan figé. Si vous
souhaitez mettre à jour l'état d'une page après sa mise en veille (y compris les
pages du bfcache), vous pouvez utiliser l'événement `resume`. Toutefois, si vous souhaitez mesurer le taux de réussite du bfcache de votre
site, vous devez utiliser l'événement `pageshow`. Dans certains cas, vous devrez peut-être utiliser les deux.

Pour en savoir plus sur les bonnes pratiques de mesure de bfcache, consultez [Comment bfcache affecte les données analytiques et la mesure des performances](https://web.dev/articles/bfcache?hl=fr#analytics).

#### Observer quand une page entre dans bfcache

L'événement `pagehide` se déclenche lorsqu'une page est désinstallée ou lorsque le navigateur tente de
la placer dans le cache amélioré.

L'événement `pagehide` comporte également une propriété `persisted`. Si la valeur est `false`, vous pouvez être sûr qu'une page n'est pas sur le point d'entrer dans le
bfcache. Toutefois, le fait que `persisted` soit `true` ne garantit pas qu'une page sera mise en cache. Cela signifie que le navigateur
a l'intention de mettre en cache la page, mais que d'autres facteurs peuvent empêcher la mise
en cache.

```
window.addEventListener('pagehide', (event) => {
  if (event.persisted) {
    console.log('This page *might* be entering the bfcache.');
  } else {
    console.log('This page will unload normally and be discarded.');
  }
});

```

De même, l'événement `freeze` se déclenche immédiatement après l'événement `pagehide` si `persisted` est `true`, mais cela signifie seulement que le navigateur a l'intention de mettre en cache la page. Il peut toutefois être amené à l'abandonner pour
plusieurs raisons, qui seront expliquées plus loin.

## Optimiser vos pages pour bfcache

Toutes les pages ne sont pas stockées dans le cache amélioré, et même si une
page y est stockée, elle n'y reste pas indéfiniment. Il est essentiel que les
développeurs comprennent les critères d'éligibilité (et d'inéligibilité) des pages à
bfcache pour maximiser leurs taux de réussite des requêtes en cache.

Les sections suivantes décrivent les bonnes pratiques à suivre pour que le
navigateur puisse mettre en cache vos pages dans la mesure du possible.

### Ne jamais utiliser l'événement `unload`

Le moyen le plus important d'optimiser pour le bfcache dans tous les navigateurs
est de ne jamais utiliser l'événement `unload`. Jamais !

L'événement `unload` pose problème pour les navigateurs, car il date d'avant le cache amélioré, et
de nombreuses pages sur Internet fonctionnent en partant du principe
(raisonnable) qu'une page ne continuera pas d'exister après le déclenchement de l'événement `unload`. Cela pose un problème, car de nombreuses pages ont également été conçues en partant du principe que l'événement `unload` se déclencherait chaque fois qu'un utilisateur quitterait la page, ce qui n'est
plus vrai (et [ne l'a pas été depuis longtemps](https://developer.chrome.com/blog/page-lifecycle-api/?hl=fr#the-unload-event)).

Les navigateurs sont donc confrontés à un dilemme : ils doivent choisir entre
une fonctionnalité qui peut améliorer l'expérience utilisateur, mais qui peut
aussi risquer de casser la page.

Sur ordinateur, Chrome et Firefox ont choisi de rendre les pages inéligibles à
bfcache si elles ajoutent un écouteur `unload`, ce qui est moins risqué, mais qui disqualifie également de nombreuses pages. Safari tentera de mettre en cache certaines pages avec un écouteur
d'événement `unload`, mais pour réduire les pannes potentielles, il n'exécutera pas l'événement `unload` lorsqu'un utilisateur quitte la page, ce qui rend l'événement très peu fiable.

Sur mobile, Chrome et Safari tentent de mettre en cache les pages avec un
écouteur d'événement `unload`, car le risque de casse est plus faible, car l'événement `unload` a toujours été extrêmement peu fiable sur mobile. Firefox considère que les
pages qui utilisent `unload` ne sont pas éligibles au bfcache, sauf sur iOS, qui exige que tous les
navigateurs utilisent le moteur de rendu WebKit. Il se comporte donc comme Safari.

Utilisez plutôt l'événement `pagehide` au lieu de l'événement `unload`. L'événement `pagehide` se déclenche dans tous les cas où l'événement `unload` se déclenche, et également lorsqu'une page est mise en cache amélioré.

En fait, [Lighthouse](https://developer.chrome.com/docs/lighthouse?hl=fr) dispose d'un [audit no-unload-listeners](https://github.com/GoogleChrome/lighthouse/pull/11085), qui avertit les développeurs si du code JavaScript sur leurs pages (y compris
celui provenant de bibliothèques tierces) ajoute un écouteur d'événements `unload`.

  warningAvertissement : N'ajoutez jamais d'écouteur d'événements `unload`. Utilisez plutôt l'événement `pagehide`. Ajouter un écouteur d'événement `unload` ralentit votre site dans Firefox, et le code ne s'exécute même pas la plupart
du temps dans Chrome et Safari.
En raison de son manque de fiabilité et de l'impact sur les performances de
bfcache, Chrome envisage d'[abandonner l'événement unload](https://developer.chrome.com/articles/deprecating-unload?hl=fr).

#### Utiliser la stratégie d'autorisation pour empêcher l'utilisation de gestionnaires de déchargement sur une page

Les sites qui n'utilisent pas de gestionnaires d'événements `unload` peuvent s'assurer qu'ils ne sont pas ajoutés à l'aide d'une [règle d'autorisation](https://developer.chrome.com/blog/deprecating-unload/?hl=fr#permissions-policy).

```
Permissions-Policy: unload=()

```

Cela empêche également les tiers ou les extensions de ralentir le site en
ajoutant des gestionnaires d'événements "unload" et de rendre le site inéligible au
bfcache.

#### Ajouter uniquement des écouteurs `beforeunload` de manière conditionnelle

L'événement `beforeunload` n'empêche pas vos pages d'être mises en cache amélioré dans les navigateurs
modernes, mais il le faisait auparavant et il reste peu fiable. Évitez donc de
l'utiliser, sauf en cas d'absolue nécessité.

Contrairement à l'événement `unload`, il existe cependant des utilisations légitimes de `beforeunload`. Par exemple, lorsque vous souhaitez avertir l'utilisateur qu'il a des
modifications non enregistrées qu'il perdra s'il quitte la page. Dans ce cas, nous vous
recommandons de n'ajouter des écouteurs `beforeunload` que lorsqu'un utilisateur a des modifications non enregistrées, puis de les
supprimer immédiatement après l'enregistrement des modifications non enregistrées.

  thumb_downÀ éviter  window.addEventListener('beforeunload', (event) => {
  if (pageHasUnsavedChanges()) {
    event.preventDefault();
    return event.returnValue = 'Are you sure you want to exit?';
  }
});Ce code ajoute un écouteur `beforeunload` sans condition.  thumb_upÀ faire  function beforeUnloadListener(event) {
  event.preventDefault();
  return event.returnValue = 'Are you sure you want to exit?';
};

// A function that invokes a callback when the page has unsaved changes.
onPageHasUnsavedChanges(() => {
  window.addEventListener('beforeunload', beforeUnloadListener);
});

// A function that invokes a callback when the page's unsaved changes are
resolved.
onAllChangesSaved(() => {
  window.removeEventListener('beforeunload', beforeUnloadListener);
});Ce code n'ajoute l'écouteur `beforeunload` que lorsqu'il est nécessaire (et le supprime lorsqu'il ne l'est pas).

### Minimiser l'utilisation de `Cache-Control: no-store`

`Cache-Control: no-store` est un en-tête HTTP que les serveurs Web peuvent définir sur les réponses pour
indiquer au navigateur de ne pas stocker la réponse dans un cache HTTP. Il est
utilisé pour les ressources contenant des informations utilisateur sensibles,
telles que les pages nécessitant une connexion.

Bien que le cache amélioré ne soit pas un cache HTTP, historiquement, lorsque `Cache-Control: no-store` est défini sur la ressource de page elle-même (par opposition à une
sous-ressource), les navigateurs ont choisi de ne pas stocker la page dans le cache
amélioré. Par conséquent, les pages qui utilisent `Cache-Control: no-store` ne sont pas nécessairement éligibles au cache amélioré. Nous [travaillons actuellement à modifier ce comportement pour Chrome](https://developer.chrome.com/docs/web-platform/bfcache-ccns?hl=fr), tout en préservant la confidentialité.

Étant donné que `Cache-Control: no-store` limite l'éligibilité d'une page au cache amélioré, il ne doit être défini que
sur les pages contenant des informations sensibles pour lesquelles le cache n'est
jamais approprié.

Pour les pages qui doivent toujours diffuser du contenu à jour (et qui ne
contiennent pas d'informations sensibles), utilisez `Cache-Control: no-cache` ou `Cache-Control: max-age=0`. Ces directives indiquent au navigateur de revalider le contenu avant de le
diffuser. Elles n'affectent pas l'éligibilité d'une page au bfcache.

Notez que lorsqu'une page est restaurée à partir de bfcache, elle est restaurée
à partir de la mémoire, et non du cache HTTP. Par conséquent, les directives
telles que `Cache-Control: no-cache` ou `Cache-Control: max-age=0` ne sont pas prises en compte, et aucune revalidation n'est effectuée avant que
le contenu ne soit présenté à l'utilisateur.

Toutefois, cette approche offre probablement une meilleure expérience
utilisateur, car les restaurations du bfcache sont instantanées et, comme les pages ne
restent pas très longtemps dans le bfcache, il est peu probable que le contenu soit
obsolète. Toutefois, si votre contenu change de minute en minute, vous pouvez
récupérer les mises à jour à l'aide de l'événement `pageshow`, comme indiqué dans la section suivante.

### Mettre à jour des données obsolètes ou sensibles après la restauration de bfcache

Si votre site conserve l'état de l'utilisateur, en particulier les informations
utilisateur sensibles, ces données doivent être mises à jour ou effacées après
la restauration d'une page à partir de bfcache.

Par exemple, si un utilisateur accède à une page de paiement, puis met à jour
son panier, une navigation en arrière peut potentiellement exposer des
informations obsolètes si une page obsolète est restaurée à partir de bfcache.

Un autre exemple, plus critique, est celui d'un utilisateur qui se déconnecte
d'un site sur un ordinateur public et que le prochain utilisateur clique sur le
bouton "Retour". Cela peut potentiellement exposer des données privées que
l'utilisateur pensait avoir effacées lorsqu'il s'est déconnecté.

Pour éviter ce type de situation, il est recommandé de toujours mettre à jour la
page après un événement `pageshow` si `event.persisted` est `true`:

```
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Do any checks and updates to the page
  }
});

```

Idéalement, vous devriez mettre à jour le contenu sur place, mais pour certaines
modifications, vous pouvez forcer un rechargement complet. Le code suivant
vérifie la présence d'un cookie spécifique au site dans l'événement `pageshow` et le recharge s'il ne le trouve pas:

```
window.addEventListener('pageshow', (event) => {
  if (event.persisted && !document.cookie.match(/my-cookie)) {
    // Force a reload if the user has logged out.
    location.reload();
  }
});

```

L'avantage d'une actualisation est qu'elle conserve l'historique (pour permettre
la navigation avant), mais une redirection peut être plus appropriée dans
certains cas.

### Annonces et restauration de bfcache

Il peut être tentant d'essayer d'éviter d'utiliser le bfcache pour diffuser un
nouvel ensemble d'annonces à chaque navigation "Retour"/"Avant". Toutefois, en
plus d'avoir un impact sur les performances, il est douteux qu'un tel comportement
améliore l'engagement des utilisateurs avec les annonces. Les utilisateurs
peuvent avoir remarqué une annonce sur laquelle ils avaient l'intention de revenir
pour cliquer dessus, mais en la rechargeant plutôt que de la restaurer à partir
du bfcache, ils ne pourront pas le faire. Il est important de tester ce scénario
(idéalement avec un test A/B) avant de faire des suppositions.

Pour les sites qui souhaitent actualiser les annonces lors de la restauration de
bfcache, il est possible de ne les actualiser que lors de l'événement `pageshow` lorsque `event.persisted` est `true`, sans affecter les performances de la page. Vérifiez auprès de votre
fournisseur d'annonces, mais [voici un exemple de procédure à suivre avec la balise Google Publishing Tag](https://developers.google.com/publisher-tag/samples/refresh?hl=fr).

### Éviter les références `window.opener`

Dans les anciens navigateurs, si une page était ouverte à l'aide de [window.open()](https://developer.mozilla.org/docs/Web/API/Window/open) à partir d'un lien avec [target=_blank](https://developer.mozilla.org/docs/Web/HTML/Element/a#target), sans spécifier [rel="noopener"](https://developer.mozilla.org/docs/Web/HTML/Link_types/noopener), la page d'ouverture comportait une référence à l'objet de fenêtre de la page
ouverte.

En plus de [présenter un risque de sécurité](https://mathiasbynens.github.io/rel-noopener/), une page avec une référence [window.opener](https://developer.mozilla.org/docs/Web/API/Window/opener) non nulle ne peut pas être placée en toute sécurité dans bfcache, car cela
pourrait endommager les pages qui tentent d'y accéder.

Il est donc préférable d'éviter de créer des références `window.opener`. Pour ce faire, utilisez `rel="noopener"` autant que possible (notez que c'est désormais le paramètre par défaut dans
tous les navigateurs modernes). Si votre site nécessite l'ouverture d'une fenêtre
et son contrôle via [window.postMessage()](https://developer.mozilla.org/docs/Web/API/Window/postMessage) ou en référençant directement l'objet de fenêtre, ni la fenêtre ouverte ni
l'ouvreur ne seront éligibles au bfcache.

### Fermez les connexions ouvertes avant que l'utilisateur ne quitte la page

Comme indiqué précédemment, lorsqu'une page est conservée dans le bfcache,
toutes les tâches JavaScript planifiées sont mises en pause et reprises lorsque la
page est retirée du cache.

Si ces tâches JavaScript planifiées n'accèdent qu'aux API DOM (ou à d'autres API
isolées à la page actuelle), la mise en pause de ces tâches lorsque la page
n'est pas visible par l'utilisateur ne pose aucun problème.

Toutefois, si ces tâches sont associées à des API accessibles depuis d'autres
pages de la même origine (par exemple, IndexedDB, Web Locks et WebSockets), cela
peut poser problème, car la mise en pause de ces tâches peut empêcher l'exécution
du code dans d'autres onglets.

Par conséquent, certains navigateurs n'essaieront pas de placer une page dans le
bfcache dans les scénarios suivants:

• Pages avec une [connexion IndexedDB](https://developer.mozilla.org/docs/Web/API/IDBOpenDBRequest) ouverte
• Pages avec [fetch()](https://developer.mozilla.org/docs/Web/API/Fetch_API) ou [XMLHttpRequest](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest) en cours
• Pages avec une connexion [WebSocket](https://developer.mozilla.org/docs/Web/API/WebSocket) ou [WebRTC](https://developer.mozilla.org/docs/Web/API/WebRTC_API) ouverte

Si votre page utilise l'une de ces API, nous vous recommandons vivement de
fermer les connexions et de supprimer ou de dissocier les observateurs lors de
l'événement `pagehide` ou `freeze`. Cela permet au navigateur de mettre en cache la page en toute sécurité sans
risquer d'affecter les autres onglets ouverts.

Ensuite, si la page est restaurée à partir du cache amélioré, vous pouvez
rouvrir ou vous reconnecter à ces API lors de l'événement `pageshow` ou `resume`.

L'exemple suivant montre comment vous assurer que les pages utilisant IndexedDB
sont éligibles à bfcache en fermant une connexion ouverte dans l'écouteur
d'événement `pagehide`:

```
let dbPromise;
function openDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open('my-db', 1);
      req.onupgradeneeded = () => req.result.createObjectStore('keyval');
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
  }
  return dbPromise;
}

// Close the connection to the database when the user leaves.
window.addEventListener('pagehide', () => {
  if (dbPromise) {
    dbPromise.then(db => db.close());
    dbPromise = null;
  }
});

// Open the connection when the page is loaded or restored from bfcache.
window.addEventListener('pageshow', () => openDB());

```

### Vérifier que vos pages peuvent être mises en cache

Chrome DevTools peut vous aider à tester vos pages afin de vérifier qu'elles
sont optimisées pour bfcache, et d'identifier les problèmes susceptibles de les
rendre incompatibles.

Pour tester une page:

1. Accédez à la page dans Chrome.
2. Dans les outils de développement, accédez à Application -> Cache amélioré.
3. Cliquez sur le bouton Run Test (Exécuter le test). DevTools tente ensuite de quitter la page, puis d'y revenir
pour déterminer si elle peut être restaurée à partir du cache amélioré.

![Panneau &quot;Cache amélioré&quot; dans les outils pour les développeurs](https://web.dev/static/articles/bfcache/image/back-forward-cache-panel-fc27405c6cd76_1440.png?hl=fr)

Panneau Cache amélioré dans DevTools.
Si le test réussit, le panneau indique "Restored from back-forward cache"
(Rétablie à partir du cache amélioré).

![Outils de développement indiquant qu&#39;une page a été restaurée à partir de
bfcache](https://web.dev/static/articles/bfcache/image/devtools-reporting-page-1dd392594f6b2_1440.png?hl=fr)

Page restaurée avec succès.
Si l'opération échoue, le panneau indique pourquoi. Si le problème peut être
résolu par un développeur, le panneau le marque comme Résoluble.

![Outils de développement signalant l&#39;échec de la restauration d&#39;une page
à partir de bfcache](https://web.dev/static/articles/bfcache/image/devtools-reporting-failur-e962032a9c1e2_1440.png?hl=fr)

Test bfcache ayant échoué avec un résultat exploitable.
Dans cet exemple, l'utilisation d'un écouteur d'événements `unload` rend la page [inéligible](https://web.dev/articles/bfcache?hl=fr#never-use-the-unload-event) au cache amélioré. Pour résoudre ce problème, remplacez `unload` par `pagehide`:

  thumb_upÀ faire  window.addEventListener('pagehide', ...);  thumb_downÀ éviter  window.addEventListener('unload', ...);
Lighthouse 10.0 a également [ajouté un audit bfcache](https://developer.chrome.com/blog/lighthouse-10-0?hl=fr#bfcache), qui effectue un test similaire. Pour en savoir plus, consultez la [documentation de l'audit bfcache](https://developer.chrome.com/docs/lighthouse/performance/bf-cache?hl=fr).

## Impact de bfcache sur les données analytiques et la mesure des performances

Si vous utilisez un outil d'analyse pour mesurer les visites sur votre site,
vous remarquerez peut-être une diminution du nombre total de pages vues
enregistrées, car Chrome active bfcache pour un plus grand nombre d'utilisateurs.

En fait, vous sous-déclarez probablement déjà les pages vues provenant d'autres
navigateurs qui implémentent bfcache, car de nombreuses bibliothèques d'analyse
populaires ne mesurent pas les restaurations bfcache en tant que nouvelles pages
vues.

Pour inclure les restaurations du cache amélioré dans le nombre de pages vues,
définissez des écouteurs pour l'événement `pageshow` et vérifiez la propriété `persisted`.

L'exemple suivant montre comment procéder avec Google Analytics. D'autres outils
d'analyse utilisent probablement une logique similaire:

```
// Send a pageview when the page is first loaded.
gtag('event', 'page_view');

window.addEventListener('pageshow', (event) => {
  // Send another pageview if the page is restored from bfcache.
  if (event.persisted) {
    gtag('event', 'page_view');
  }
});

```

### Mesurer votre taux d'accès au bfcache

Vous pouvez également mesurer si le bfcache a été utilisé pour identifier les
pages qui ne l'utilisent pas. Pour ce faire, mesurez le type de navigation pour
les chargements de page:

```
// Send a navigation_type when the page is first loaded.
gtag('event', 'page_view', {
   'navigation_type': performance.getEntriesByType('navigation')[0].type;
});

window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    // Send another pageview if the page is restored from bfcache.
    gtag('event', 'page_view', {
      'navigation_type': 'back_forward_cache';
    });
  }
});

```

Calculez votre taux de réussite du bfcache à l'aide des totaux des navigations `back_forward` et `back_forward_cache`.

Il est important de savoir qu'il existe un certain nombre de scénarios, hors du
contrôle des propriétaires de sites, où la navigation "Retour"/"Avant" n'utilise
pas le bfcache, y compris:

• lorsque l'utilisateur ferme le navigateur et le redémarre
• Lorsque l'utilisateur duplique un onglet
• Lorsque l'utilisateur ferme un onglet et le rouvre

Dans certains cas, le type de navigation d'origine peut être conservé par
certains navigateurs et peut donc afficher un type de `back_forward`, même s'il ne s'agit pas de navigations "Précédent"/"Suivant".

Même sans ces exclusions, le bfcache sera supprimé au bout d'un certain temps
pour économiser de la mémoire.

Par conséquent, les propriétaires de sites Web ne doivent pas s'attendre à un
taux de réussite de 100% pour toutes les navigations `back_forward`. Toutefois, mesurer leur ratio peut être utile pour identifier les pages où la
page elle-même empêche l'utilisation de bfcache pour une forte proportion de
navigations avant et arrière.

L'équipe Chrome a ajouté l'[API NotRestoredReasons](https://developer.chrome.com/docs/web-platform/bfcache-notrestoredreasons?hl=fr) pour identifier les raisons pour lesquelles les pages n'utilisent pas bfcache,
afin que les développeurs puissent améliorer leurs taux de requêtes bfcache.
L'équipe Chrome a également [ajouté des types de navigation à CrUX](https://developer.chrome.com/blog/crux-navigation-types?hl=fr), ce qui permet de voir le nombre de navigations bfcache même sans les mesurer
vous-même.

### Mesure des performances

bfcache peut également avoir un impact négatif sur les métriques de performances
collectées [sur le terrain](https://web.dev/articles/user-centric-performance-metrics?hl=fr#in_the_field), en particulier celles qui mesurent les temps de chargement des pages.

Étant donné que les navigations bfcache restaurent une page existante plutôt que
de lancer un nouveau chargement de page, le nombre total de chargements de page
collectés diminue lorsque bfcache est activé. Toutefois, il est important de
noter que les chargements de pages remplacés par des restaurations du cache
amélioré étaient probablement parmi les chargements de pages les plus rapides de votre
ensemble de données. En effet, les navigations "Retour" et "Avant"
correspondent, par définition, à des visites répétées, et les chargements de pages répétés
sont généralement plus rapides que ceux des visiteurs pour la première fois (en
raison de la [mise en cache HTTP](https://web.dev/articles/http-cache?hl=fr), comme indiqué précédemment).

Par conséquent, votre ensemble de données contient moins de chargements de pages
rapides, ce qui risque de fausser la distribution plus lentement, même si les
performances de l'utilisateur ont probablement été améliorées.

Il existe plusieurs façons de résoudre ce problème. L'une consiste à annoter
toutes les métriques de chargement de page avec leur [type de navigation](https://www.w3.org/TR/navigation-timing-2/#sec-performance-navigation-types) respectif: `navigate`, `reload`, `back_forward` ou `prerender`. Vous pouvez ainsi continuer à surveiller vos performances dans ces types de
navigation, même si la distribution globale est négative. Nous recommandons cette
approche pour les métriques de chargement de page non centrées sur
l'utilisateur, comme le [temps de latence du premier octet (TTFB)](https://web.dev/articles/ttfb?hl=fr).

Pour les métriques axées sur l'utilisateur, comme les [Core Web Vitals](https://web.dev/articles/vitals?hl=fr), il est préférable de signaler une valeur qui représente plus précisément
l'expérience utilisateur.

  errorAttention : Le type de navigation `back_forward` de l'[API Navigation Timing](https://www.w3.org/TR/navigation-timing-2/#sec-performance-navigation-types) ne doit pas être confondu avec les restaurations bfcache. L'API
Navigation Timing n'annote que les chargements de page, tandis que les restaurations bfcache
réutilisent une page chargée à partir d'une navigation précédente.

### Impact sur les Core Web Vitals

Les [Core Web Vitals](https://web.dev/articles/vitals?hl=fr) mesurent l'expérience utilisateur d'une page Web sur plusieurs dimensions
(vitesse de chargement, interactivité, stabilité visuelle). Étant donné que les
utilisateurs perçoivent les restaurations bfcache comme des navigations plus rapides
que les chargements de pages complètes, il est important que les métriques Core
Web Vitals le reflètent. Après tout, un utilisateur ne se soucie pas de savoir
si bfcache a été activé ou non. Il veut simplement que la navigation soit rapide.

Les outils qui collectent et génèrent des rapports sur les métriques Core
Web Vitals, comme le [rapport sur l'expérience utilisateur Chrome](https://developer.chrome.com/docs/crux?hl=fr), traitent les restaurations bfcache comme des visites de pages distinctes dans
leur ensemble de données. Bien qu'il n'existe pas d'API Web dédiées pour mesurer
ces métriques après la restauration de bfcache, vous pouvez estimer leurs
valeurs à l'aide des API Web existantes:

• Pour [Largest Contentful Paint (LCP)](https://web.dev/articles/lcp?hl=fr), utilisez le delta entre le code temporel de l'événement `pageshow` et celui du prochain frame peint, car tous les éléments du frame seront peints
en même temps. En cas de restauration du cache amélioré, les LCP et FCP sont
identiques.
• Pour [Interaction to Next Paint (INP)](https://web.dev/articles/inp?hl=fr), continuez à utiliser votre observateur de performances existant, mais
réinitialisez la valeur INP actuelle sur 0.
• Pour [Cumulative Layout Shift (CLS)](https://web.dev/articles/cls?hl=fr), continuez à utiliser votre observateur de performances existant, mais
réinitialisez la valeur CLS actuelle sur 0.

Pour en savoir plus sur l'impact de bfcache sur chaque métrique, consultez les [pages des guides de métriques](https://web.dev/articles/vitals?hl=fr#core_web_vitals) pour chaque métrique Core Web Vitals. Pour obtenir un exemple concret
d'implémentation des versions bfcache de ces métriques, consultez la [PR les ajoutant à la bibliothèque JS Web Vitals](https://github.com/GoogleChrome/web-vitals/pull/87).

La bibliothèque JavaScript [web-vitals](https://github.com/GoogleChrome/web-vitals) [est compatible avec les restaurations bfcache](https://github.com/GoogleChrome/web-vitals/pull/87) dans les métriques qu'elle génère.

## Autres ressources

• [Mise en cache de Firefox](https://developer.mozilla.org/Firefox/Releases/1.5/Using_Firefox_1.5_caching) (bfcache dans Firefox)
• [Cache de page](https://webkit.org/blog/427/webkit-page-cache-i-the-basics/) (bfcache dans Safari)
• [Cache avant/arrière: comportement exposé sur le Web](https://docs.google.com/document/d/1JtDCN9A_1UBlDuwkjn1HWxdhQ1H2un9K4kyPLgBqJUc/edit?usp=sharing&hl=fr) (différences entre les navigateurs concernant le bfcache)
• [Outil de test bfcache](https://back-forward-cache-tester.glitch.me/?persistent_logs=1) (teste l'impact des différentes API et événements sur bfcache dans les
navigateurs)
• [Performance Game Changer: Browser Back/Forward Cache](https://www.smashingmagazine.com/2022/05/performance-game-changer-back-forward-cache/) (étude de cas de Smashing Magazine montrant des améliorations spectaculaires des
Core Web Vitals en activant bfcache)

  Ce contenu vous a-t-il été utile ?  
Sauf indication contraire, le contenu de cette page est régi par une licence [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/), et les échantillons de code sont régis par une licence [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0). Pour en savoir plus, consultez les [Règles du site Google Developers](https://developers.google.com/site-policies?hl=fr). Java est une marque déposée d'Oracle et/ou de ses sociétés affiliées.

Dernière mise à jour le 2024/10/11 (UTC).

## Additional Links

- [web.dev](https://web.dev/)
- [Référence](https://web.dev/baseline)
- [Utiliser la variante de référence](https://web.dev/how-to-use-baseline)
- [Blog](https://web.dev/blog)
- [Études de cas](https://web.dev/case-studies)
- [Accueil](https://web.dev/?hl=fr)
- [Articles](https://web.dev/articles?hl=fr)
- [Signaler un bug](https://issuetracker.google.com/issues/new?component=1400680&template=1857359)
- [Afficher les questions en suspens](https://issuetracker.google.com/issues?q=status:open%20componentid:1400680&s=created_time:desc)
- [Chrome pour les développeurs](https://developer.chrome.com/)
- [Mises à jour de Chromium](https://blog.chromium.org/)
- [Études de cas](https://web.dev/case-studies)
- [Podcasts et émissions](https://web.dev/shows)
- [@ChromiumDev sur X](https://twitter.com/ChromiumDev)
- [YouTube](https://www.youtube.com/user/ChromeDevelopers)
- [Chrome pour les développeurs sur LinkedIn](https://www.linkedin.com/showcase/chrome-for-developers)
- [RSS](https://web.dev/static/blog/feed.xml)
- [Conditions d'utilisation](https://policies.google.com/terms?hl=fr)
- [Règles de confidentialité](https://policies.google.com/privacy?hl=fr)
