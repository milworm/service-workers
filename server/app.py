import cherrypy
import redis
import requests

class Notification:
    url = 'https://android.googleapis.com/gcm/send'

    def notify(self, token, data):
        json = self.get_data(token)
        headers = self.get_headers()
        result = requests.post(Notification.url, json=json, headers=headers)
        print result.content

    def get_data(self, token):
        return {
            'registration_ids': [token]
        }

    def get_headers(self):
        return {
            'Content-Type': 'application/json', 
            'Authorization': 'key=AIzaSyBO0C1B5xVs9Y9XeCPBSkSr1_BDing5XkY'
        }

class Application(object):
    def __init__(self):
        self.db = redis.StrictRedis()

    def get_key(self, user_id):
        return 'user:{0}'.format(user_id)

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def subscribe(self):
        '''adds user to list of users how can receive push notifications'''
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
        Notification().notify(token, data)

        return {
            'success': True
        }

    @cherrypy.expose
    @cherrypy.tools.json_in()
    @cherrypy.tools.json_out()
    def users(self):
        '''list of users'''
        keys = []
        for key in self.db.scan_iter('user:*'): 
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