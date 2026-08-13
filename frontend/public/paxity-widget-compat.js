/**
 * paxity-widget-compat.js
 *
 * Fournit `window.PaxityWidget.open({ … })`, l'API décrite par la
 * documentation Paxity (https://paxity.io/documentation/widget) mais absente
 * du script réellement livré.
 *
 * Ce que livre `https://saas.paxity.io/widget/paxity-widget.iife.js` :
 *   · un global `ReactPaymentModal`, composant React `({ token, isOpen })` ;
 *   · aucun `PaxityWidget`, aucune méthode `open()` ;
 *   · React et ReactDOM attendus en globals, en version 19 ;
 *   · un appel à `process.env` non substitué au build, qui interrompt le
 *     chargement si `process` n'existe pas.
 *
 * Ce fichier comble l'écart : il pose le shim `process`, charge React 19 et le
 * bundle, puis expose `open()` qui traduit les options documentées en jeton
 * attendu par le composant. À jeter le jour où l'éditeur publiera vraiment
 * l'API de sa documentation.
 *
 * Usage — exactement l'extrait de la doc :
 *
 *   <script src="paxity-widget-compat.js"></script>
 *   <script>
 *     if (window.PaxityWidget) {
 *       window.PaxityWidget.open({
 *         amount: 100,
 *         currency: 'XOF',
 *         country: 'CI',
 *         ipn: 'https://exemple.ci/ipn',
 *         idClient: '00000000',
 *         credentials: { apikey: 'private_…', apiToken: '…' },
 *       });
 *     }
 *   </script>
 */

(function () {
  'use strict';

  var REACT = 'https://esm.sh/react@19.0.0';
  var REACT_DOM = 'https://esm.sh/react-dom@19.0.0';
  var WIDGET = 'https://saas.paxity.io/widget/paxity-widget.iife.js';
  var CONTENEUR = 'paxity-widget-conteneur';

  // Le bundle lit `process.env` : sans ce shim il s'arrête sur
  // « ReferenceError: process is not defined » et ne définit aucun global.
  window.process = window.process || { env: { NODE_ENV: 'production' } };

  var pret = null; // Promise du chargement, lancée à la première ouverture.
  var racine = null;

  function chargerScript(src) {
    return new Promise(function (ok, ko) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = ok;
      s.onerror = function () {
        ko(new Error('chargement impossible : ' + src));
      };
      document.head.appendChild(s);
    });
  }

  function charger() {
    if (pret) return pret;

    pret = (async function () {
      // React 19 n'a plus de build UMD : import ESM puis exposition en global,
      // seule forme que le bundle Paxity sache consommer.
      var React = (await import(REACT)).default;
      var reactDom = await import(REACT_DOM);
      var reactDomClient = await import(REACT_DOM + '/client');

      window.React = React;
      // `createPortal` vient de react-dom, `createRoot` de react-dom/client :
      // le bundle attend les deux sur le même objet.
      window.ReactDOM = Object.assign({}, reactDom.default || reactDom, reactDomClient);

      await chargerScript(WIDGET);

      if (typeof window.ReactPaymentModal !== 'function') {
        throw new Error('le bundle Paxity n’a pas exposé ReactPaymentModal');
      }
      return React;
    })();

    return pret;
  }

  function base64url(objet) {
    var octets = new TextEncoder().encode(JSON.stringify(objet));
    var ascii = '';
    for (var i = 0; i < octets.length; i++) ascii += String.fromCodePoint(octets[i]);
    return btoa(ascii).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  }

  /**
   * Traduit les options documentées en jeton.
   *
   * Le composant décode le jeton avec `jwt-decode`, qui lit la charge utile
   * sans vérifier la signature : un jeton assemblé ici suffit donc. Dès que
   * votre serveur sait en émettre un, passez-le en `options.token` — les
   * identifiants marchands ne transiteront alors plus par le navigateur.
   */
  function tokenDepuisOptions(options) {
    if (options.token) return options.token;

    var creds = options.credentials || {};
    var charge = {
      // La doc écrit `apikey`, le bundle lit `apiKey` : on accepte les deux.
      apiKey: creds.apiKey || creds.apikey || '',
      apiToken: creds.apiToken || creds.apitoken || '',
      // Identifiant du compte développeur. Absent, le widget appelle
      // /developer-accounts//… et répond « Token expiré ».
      id: options.id || options.developerAccountId || creds.id || '',
      amount: Number(options.amount) || 0,
      currency: options.currency || 'XOF',
      country: options.country || '',
      ipn: options.ipn || '',
      callback: options.callback || '',
      product: options.product || '',
      idClient: options.idClient || '',
    };

    if (!charge.apiKey || !charge.apiToken) {
      throw new Error('credentials.apikey et credentials.apiToken sont requis');
    }

    return base64url({ alg: 'HS512', typ: 'JWT' }) + '.' + base64url(charge) + '.non-signe';
  }

  function conteneur() {
    var el = document.getElementById(CONTENEUR);
    if (!el) {
      el = document.createElement('div');
      el.id = CONTENEUR;
      document.body.appendChild(el);
    }
    return el;
  }

  function rendre(React, token, isOpen) {
    if (!racine) racine = window.ReactDOM.createRoot(conteneur());
    racine.render(
      React.createElement(window.ReactPaymentModal, { token: token, isOpen: isOpen }),
    );
  }

  window.PaxityWidget = {
    /**
     * Ouvre la modale de paiement.
     * @returns {Promise<void>} résolue une fois la modale montée, rejetée si le
     *   chargement échoue — la doc ne prévoit aucun rappel d'erreur.
     */
    open: function (options) {
      var opts = options || {};
      var token;
      try {
        token = tokenDepuisOptions(opts);
      } catch (e) {
        return Promise.reject(e);
      }

      return charger().then(function (React) {
        // Le widget authentifie ses appels au merchant-service avec
        // localStorage["apiKeyOldVersion"] / ["apiTokenOldVersion"], clés qu'il
        // ne renseigne jamais lui-même en décodant le jeton.
        var creds = opts.credentials || {};
        var cle = creds.apiKey || creds.apikey;
        var jeton = creds.apiToken || creds.apitoken;
        if (cle && jeton) {
          localStorage.setItem('apiKeyOldVersion', cle);
          localStorage.setItem('apiTokenOldVersion', jeton);
        }

        rendre(React, token, true);
      });
    },

    /** Referme la modale. Absente de la doc, utile en pratique. */
    close: function () {
      if (racine) racine.render(null);
    },

    /** Vrai si le bundle est chargé et le composant disponible. */
    estPret: function () {
      return typeof window.ReactPaymentModal === 'function';
    },
  };
})();
