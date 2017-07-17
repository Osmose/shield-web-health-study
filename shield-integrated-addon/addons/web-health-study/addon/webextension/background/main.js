'use strict';

/* global browser */

console.log("hello");

const DESIGNATED_HOSTNAMES = ['www.amazon.com', 'www.etsy.com', 'www.kickstarter.com', 'www.netflix.com',
                              'twitter.com', 'vimeo.com', 'github.com', 'www.privateinternetaccess.com', 'www.reddit.com',
                              'www.ycombinator.com', 'www.mozilla.org', 'www.pornhub.com', 'www.okcupid.com', '18millionrising.org',
                              '99designs.com', 'www.accessnow.org', 'www.aclu.org', 'actionnetwork.org', 'www.acquia.com',
                              'www.adafruit.com', 'getadblock.com', 'adblockplus.org', 'www.ala.org', 'www.anchorfree.com',
                              'asbcouncil.org', 'www.atlassian.com', 'atomattic.com', 'www.athorsguild.org', 'bandcamp.com',
                              'www.bestvpn.com', 'www.bigchaindb.com', 'www.bittorrent.com', 'bitbucket.org', 'bloody-disgusting.com',
                              'boingboing.net', 'brave.com', 'www.burlington.com', 'www.ccianet.org', 'ccmixter.org', 'cdt.org', 'www.change.org',
                              'checkout.com', 'www.chess.com', 'civicrm.org', 'www.codecademy.com', 'www.colorofchange.org', 'www.commoncause.org',
                              'www.consumerreports.org', 'consequenceofsound.net', 'home.coworker.org', 'creativecommons.org', 'credomobile.com',
                              'www.dailykos.com', 'www.deviantart.com', 'discordapp.com', 'www.digitalocean.com', 'www.digitalwest.com', 'www.democracyforamerica.com',
                              'www.dreadcentral.com','www.dreamhost.com', 'dribbble.com', 'www.dropbox.com', 'duckduckgo.com', 'www.eff.org', 'www.exaptive.com',
                              'www.experts-exchange.com', 'www.fark.com', 'faithfulinternet.org', 'www.funnyordie.com', 'freemusicarchive.org', 'www.goldenfrog.com',
                              'www.greenpeace.org', 'iheartmob.org', 'www.ifixit.com', 'imgur.com', 'www.internetarchive.org', 'ipdb.foundation', 'ipfs.io', 'www.ipvanishvpn.com',
                              'www.linode.com', 'libertyvps.net', 'medium.com', 'www.metalsucks.net', 'michaeltrimmshow.com', 'www.minds.com', 'front.moveon.org', 'mpowerchange.org',
                              'www.mainstreetalliance.org', 'www.namecheap.com', 'www.thenation.com', 'ncac.org', 'www.nhmc.org', 'nextdoor.com', 'www.opendemocracy.net', 'openmedia.org',
                              'www.optimizely.com', 'www.oreilly.com', 'opensource.org', 'www.palantir.net', 'pantheon.io', 'patook.com', 'www.patreon.com', 'www.pornmd.com',
                              'plays.tv', 'priceonomics.com', 'www.plos.org', 'www.redfin.com', 'www.redtube.com', 'www.rockthevote.com', 'www.shapeways.com', 'www.simpleinout.com',
                              'slashdot.org', 'slickdeals.net', 'www.sonic.com', 'songmeanings.com', 'sourceforge.net', 'soundcloud.com', 'www.sovrn.com', 'www.spotify.com', 'stackoverflow.com',
                              'www.startmail.com', 'www.startpage.com', 'www.tastemade.com', 'www.tanaza.com', 'www.thinkgeek.com', 'www.ting.com', 'www.teamsnap.com', 'techgage.com', 'www.top10vpn.com',
                              'www.tunnelbear.com', 'www.twillio.com', 'www.urbandictionary.com', 'usdac.us', 'venturebeat.com', 'impact.vice.com', 'vivaldi.com', 'voqal.com', 'www.wanderu.com', 'www.womensmarch.com',
                              'webfoundation.org', 'www.youporn.com', 'zapier.com', 'zenmate.com', 'www.mozilla.org']
const MESSAGES = {
  c: '',
  vi: 'Net neutrality is one of the biggest First Amendment issues of the Internet. Without it, voices could be censored.',
  sice: '{domain} supports net neutrality, because they want the internet to stay open and free.',
  simo: 'Three quarters of Americans (76%) support net neutrality, including  the vast majority of Democrats and Republicans.'
}
const SILENCE_LENGTHS_HOURS = {
  r1: Infinity,
  r2: 7*24,
  r4: 3*24,
  r14: 2*24
}

const BASE_SURVEY_URL = 'https://qsurvey.mozilla.com/s3/Understanding-the-Web-Shield-Study'
const BASE_FORM_URL= "https://advocacy.mozilla.org/en-US/net-neutrality-comments-simple/?test=true"

let TREATMENT_STAGE_LENGTH = 2 * 7 * 24 * 60 * 60// in seconds
let OBSERVATION_STAGE_LENGTH = 2 * 7 * 24 * 60 * 60// in seconds

const PANEL_TIMEOUT = 25*1000

const NOTIFICATION_TITLE = 'Take Action on Net Neutrality';

/*******
  Branches

    Message Frame Treatment
          =>
          control(c)
          value influence (vi)
          social influence -- corporate endorsement(sice)
          social influence -- majority opinion(simo)
          appeal to self-interest(atsi)

    Repitition Assignment
          =>
          once(r1)
          no more than once a week(r2)
          no more once per three days(r4)
          no more than once per two days(r14)
******/

const self = {
  port: {
    on: function(header, handle){
      browser.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if (message.header == header)
          handle(message.data)
      })
    },
    emit: function(header, data){
      browser.runtime.sendMessage({header, data})
    }
  }
}

function telemetry (data) {
  function throwIfInvalid (obj) {
    // simple, check is all keys and values are strings
    for (const k in obj) {
      if (typeof k !== 'string') throw new Error(`key ${k} not a string`);
      if (typeof obj[k] !== 'string') throw new Error(`value ${k} ${obj[k]} not a string`);
    }
    return true
  }
  throwIfInvalid(data);
  msgStudy('telemetry', data);
}

// template code for talking to `studyUtils` using `browser.runtime`
async function msgStudy(msg, data) {
  const allowed = ['endStudy', 'telemetry', 'info'];
  if (!allowed.includes(msg)) throw new Error(`shieldUtils doesn't know ${msg}, only knows ${allowed}`);
  try {
    const ans = await browser.runtime.sendMessage({shield: true, msg, data});
    return ans;
  } catch (e) {
    console.log('OHNO', e);
  }
}

class Notification {
  constructor(title, baseMessage, hostname, elapsedTime, count){
    this.message = baseMessage.replace('{domain}', hostname)
    this.title = title
    this.hostname = hostname
    this.time = Date.now()
    this.elapsedTime = elapsedTime
    this.response_action = false
    this.response_dismiss = false
    this.close = false
    this.infoPage = false
    this.count = count
    this.showLength = 0 // not used yet
    this.openCount = 0
    this.result = 'noresult'
  }
}

class NetNeutralityStudy {
  constructor(){
  }
  async start(){
    this.info = await msgStudy('info')

    self.port.on('console', (m) => console.log(m))
    self.port.on('panel-ready', this.populatePanel.bind(this))
    self.port.on('response', this.response.bind(this))
    self.port.on('closeButton', this.close.bind(this))
    self.port.on('infoPage', this.showInfoPage.bind(this))

    let isFirstRun = !(await browser.storage.local.get('initialized'))['initialized']
    if (isFirstRun) await this.firstRun()

    this.branch = (await browser.storage.local.get('branch'))['branch']
    this.startTime = (await browser.storage.local.get('starttime'))['starttime']
    this.notificationData = (await browser.storage.local.get('notificationdata'))['notificationdata']
    this.notificationSummary = (await browser.storage.local.get('notificationsummary'))['notificationsummary']
    this.stage = (await browser.storage.local.get('stage'))['stage']

    if (isFirstRun){
      await this.changeStage('treatment')
      this.reportStatus('enrolled')
    }

    this.checkStage()

    if (this.stage == 'treatment') this.listenForUrls()

    this.monitorStage()
  }
  async checkStage(){
    if (this.stage == 'treatment' && this.elapsedTimeSeconds > TREATMENT_STAGE_LENGTH){
      await this.changeStage('observation')
    }

    if (this.stage != 'end' && this.elapsedTimeSeconds > TREATMENT_STAGE_LENGTH + OBSERVATION_STAGE_LENGTH){
      await this.changeStage('end')
      this.end()
    }
  }
  async firstRun(){
    console.log('first run')
    await this.assignBranch()
    await browser.storage.local.set({initialized: true})
    await browser.storage.local.set({starttime: Date.now()})
    await browser.storage.local.set({notificationdata: []})
    await browser.storage.local.set({notificationsummary: {
      response_action: false,
      response_dismiss: false,
      notification_count: 0
    }})
    await browser.storage.local.set({stage: 'treatment'})
  }
  changeStage(newStage){
    this.stage = newStage
    browser.storage.local.set({stage: newStage})
    this.reportStatus(newStage)

    switch(newStage) {
      case 'treatment':
        this.openSurvey('1')
        break
      case 'observation':
        this.openSurvey('2')
        break
      case 'end':
        this.openSurvey('3')
        break
    }

    console.log(`stage changed to ${this.stage}`)
  }
  async reportStatus(status){
    let tabs_open = (await browser.tabs.query({})).length
    let windows_open = (await browser.windows.getAll()).length
    telemetry({
      'message_type': 'study_status',
      'branch_frequency': this.branch.repitition,
      'branch_message': this.branch.message,
      'branch': this.info.variation.name,
      'profile_tabs_open': String(tabs_open),
      'profile_windows_open': String(windows_open),
      'elapsed_time': String(this.elapsedTime),
      'stage': String(this.stage),
      'status': String(status)
    })
  }
  monitorStage(){
    let that = this
    window.setInterval(()=>{
      that.checkStage()
    }, 10 * 60 * 1000)
  }
  async assignBranch(){
    let branch = {message: this.info.variation.message, repitition: this.info.variation.repitition}
    return browser.storage.local.set({branch})
  }
  get elapsedTime(){
    return Date.now() - this.startTime
  }
  get elapsedTimeSeconds(){
    return Math.floor(this.elapsedTime / 1000)
  }
  get silenceLength(){
    return SILENCE_LENGTHS_HOURS[this.branch.repitition]*60*60*1000
  }
  get recentNotification(){
    return this.notificationData[this.notificationData.length-1]
  }
  getHostname(href) { // https://stackoverflow.com/a/736970
    let l = document.createElement('a');
    l.href = href;
    return l.hostname;
  }
  isADesignatedUrl(url){
    console.log(`hostname: ${this.getHostname(url)}`)
    return (DESIGNATED_HOSTNAMES.indexOf(this.getHostname(url)) != -1)
  }
  listenForUrls(){
    let that = this
    browser.tabs.onUpdated.addListener(function(id, info, t){
      if (info.url && that.isADesignatedUrl(info.url)){
        browser.pageAction.hide(id) // ensuring that the page action is not always visible
        that.tryShowNotification(that.getHostname(info.url), id)
      }
    });
  }
  async updateRecentNotification(key, value){
    this.notificationData[this.notificationData.length-1][key] = value
    await browser.storage.local.set({notificationdata: this.notificationData})
  }
  response(r){
    console.log(`response: ${r}`)
    if (r == 'primaryButton') {
      let formUrl = this.mergeQueryArgs(BASE_FORM_URL, {
        utm_source: this.info.studyName,
        shield_branch: this.info.variation.name,
        shield_branch_message: this.branch.message,
        shield_branch_repitition: this.branch.repitition,
        shield_id: this.info.shieldId,
        shield_addon_id: this.info.addon.id,
        shield_addon_version: this.info.addon.version,
        shield_notification_count: this.recentNotification.count
      })
      self.port.emit('show-form', formUrl)
      console.log(`opening form url: ${formUrl}`)
      self.port.emit('autohide-notification')
      this.notificationSummary['response_action'] = true
      this.updateRecentNotification('response_action', true)
      this.updateRecentNotification('result', 'action')
      browser.storage.local.set({notificationsummary: this.notificationSummary})
    }
    if (r == 'secondaryButton') {
      // hide notification
      self.port.emit('hide-notification')
      this.notificationSummary['response_dismiss'] = true
      this.updateRecentNotification('response_dismiss', true)
      if (this.recentNotification.result == 'noresult')  // shouldn't override the action result
        this.updateRecentNotification('result', 'dismiss')
      browser.storage.local.set({notificationsummary: this.notificationSummary})

    }
  }
  mergeQueryArgs(url, ...args) {
    /* currently left to right*/

    const U = new URL(url);
    let q = U.search || "?";
    q = new URLSearchParams(q);

    const merged = Object.assign({}, ...args);

    // get user info.
    Object.keys(merged).forEach((k) => {
      console.debug(q.get(k), k, merged[k]);
      q.set(k, merged[k]);
    });

    U.search = q.toString();
    return U.toString();
  }
  openSurvey(interval){
    console.log(`opening survey => interval ${interval}`)
    let url = this.mergeQueryArgs(BASE_SURVEY_URL, {
      interval,
      studyname: this.info.studyName,
      branch: this.info.variation.name,
      branch_message: this.branch.message,
      branch_repitition: this.branch.repitition,
      shield_id: this.info.shieldId,
      shield_addon_id: this.info.addon.id,
      shield_addon_version: this.info.addon.version
    })
    browser.tabs.create({url})
  }
  close(){
    self.port.emit('hide-notification')
    this.updateRecentNotification('close', true)
    if (this.recentNotification.result == 'noresult') // shouldn't override the action result
      this.updateRecentNotification('result', 'close')

  }
  populatePanel(){
    self.port.emit('updateEntry', {
      title: this.recentNotification.title,
      message: this.recentNotification.message,
      primaryButtonLabel: 'Take Action',
      secondaryButtonLabel: 'Got it',
      icon: '../images/mozilla.png'
    });

    this.updateRecentNotification('openCount', this.recentNotification.openCount + 1)
  }
  currentDate(){ // to be replaced for debugging
    return Date.now()
  }
  canShowNotification(){
    if (this.stage != 'treatment') return false
    if (!this.recentNotification) return true

    for (let i of this.notificationData)    // do not show the notification if action taken
      if (i.response_action) return false

    return (this.currentDate() - this.recentNotification.time > this.silenceLength)
  }
  async tryShowNotification(hostname, tabId){
    console.log('trying to show the notification')
    if (this.canShowNotification()) return this.showNotification(hostname, tabId)
    return false
  }
  async showNotification(hostname, tabId){
    console.log('showing a notification')
    let notification = new Notification(
                                        NOTIFICATION_TITLE,
                                        MESSAGES[this.branch.message],
                                        hostname, this.elapsedTime,
                                        this.notificationData.length+1
                                      )
    browser.pageAction.show(tabId)
    this.notificationData.push(notification)
    self.port.emit('show-notification')
    await browser.storage.local.set({notificationdata: this.notificationData})
    this.initiateNotificationTimeout();

    let that = this

    let listener = function(id, info, t){
      if (info.url && id == tabId){
        that.concludeNotification()
        browser.tabs.onUpdated.removeListener(listener)
      }
    }
    browser.tabs.onUpdated.addListener(listener) // send notification data when it has to hide
  }
  initiateNotificationTimeout(){
    window.setTimeout(()=>{
      self.port.emit('autohide-notification')
    }, PANEL_TIMEOUT);
  }
  logStorage(){
    browser.storage.local.get().then(console.log)
  }
  showInfoPage(){
    browser.tabs.create({
      url: '/presentation/html/about.html',
      active: true
    })
    updateRecentNotification('infoPage', true)
  }
  concludeNotification(){
    console.log('concluding the notification')
    let rn = this.recentNotification

    this.reportRecentNotification()
    this.reportNotificationSequence()
  }
  async reportRecentNotification(){
    let rn = this.recentNotification
    let tabs_open = (await browser.tabs.query({})).length
    let windows_open = (await browser.windows.getAll()).length
    telemetry({
      'message_type': 'notification_instance',
      'branch_frequency': this.branch.repitition,
      'branch_message': this.branch.message,
      'branch': this.info.variation.name,
      'profile_tabs_open': String(tabs_open),
      'profile_windows_open': String(windows_open),
      'elapsed_time': String(this.elapsedTime),
      'stage': String(this.stage),
      'result': rn.result,
      'response_action': String(rn.response_action),
      'response_dismiss': String(rn.response_dismiss),
      'close': String(rn.close),
      'infoPage': String(rn.infoPage),
      'form_submitted': 'none',  // to be tracked through GA, we cannot do it here
      'host_name': String(rn.hostname),
      'count': String(rn.count),
      'open_count': String(rn.openCount),
      'show_length': 'none'
    })
  }
  async reportNotificationSequence(){
    let rn = this.recentNotification 
    let tabs_open = (await browser.tabs.query({})).length
    let windows_open = (await browser.windows.getAll()).length
    telemetry({
      'message_type': 'notification_sequence',
      'branch_frequency': this.branch.repitition,
      'branch_message': this.branch.message,
      'branch': this.info.variation.name,
      'profile_tabs_open': String(tabs_open),
      'profile_windows_open': String(windows_open),
      'elapsed_time': String(this.elapsedTime),
      'stage': String(this.stage),
      'length': String(this.notificationData.length),
      'response_action': String(this.notificationSummary.response_action),
      'average_frequency': String(this.notificationData.length/this.elapsedTimeSeconds),
      'last_result': this.recentNotification.result
    })
  }
  end(){
    // send telemetry message
    this.cleanup()
    self.port.emit('self-uninstall')
  }
  cleanup(){
    // clean up
    console.log('cleaning up...')
    browser.storage.local.clear()
  }
}

let study = new NetNeutralityStudy();
study.start();
