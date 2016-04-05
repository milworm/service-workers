import cherrypy
import redis
import requests

class Notification:
    API_URL = 'https://android.googleapis.com/gcm/send'
    API_KEY = 'AIzaSyCdiN1gXE3_-fnsxpgRtnKB4sEX5SS0kmw'

    def __init__(self, data):
        self.title = data['title']
        self.message = data['message']

    def notify(self, token):
        json = self.get_data(token)
        headers = self.get_headers()
        return requests.post(Notification.API_URL, json=json, headers=headers)

    def get_data(self, token):
        '''
            The first version of Push Notifications API doesnt support
            sending title and message. 
            'data': {
                'title': self.title,
                'message': self.message
            }
        '''
        return {
            'registration_ids': [token]
        }

    def get_headers(self):
        return {
            'Content-Type': 'application/json', 
            'Authorization': 'key={0}'.format(Notification.API_KEY)
        }

class Application(object):
    def __init__(self):
        self.db = redis.StrictRedis()

    def get_key(self, user_id):
        return 'push-notifications:user:{0}'.format(user_id)

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def subscribe(self):
        '''adds user to list of users who can receive push notifications'''
        data = cherrypy.request.json
        user_id = data['user_id']
        user_token = data['user_token']
        response = {'success': False}

        if user_id and user_token:
            key = self.get_key(user_id)
            self.db.set(key, user_token)
            response['success'] = True

        return response

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def notify(self):
        '''sends a push notification based on a user_id'''
        data = cherrypy.request.json
        user_id = data['user_id']
        key = self.get_key(user_id)
        token = self.db.get(key)
        Notification(data).notify(token)

        return {
            'success': True
        }

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def users(self):
        '''list of users'''
        key = self.get_key('*')
        keys = []
        for key in self.db.scan_iter(key):
            keys.append({
                'key': key,
                'value': self.db.get(key)
            })

        return {
            'success': True,
            'users': keys
        }

if __name__ == '__main__':
    cherrypy.config.update({'server.socket_port': 8081})
    cherrypy.quickstart(Application())