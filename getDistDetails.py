import requests,sys
from bs4 import BeautifulSoup

def findOnline(dist):
  # dist = "Azamgarh"
  # url = pyperclip.paste()
  if dist == 'test':
    return dist
  else:
    try:
      url = "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Uttar_Pradesh"
      page = requests.get(url)
      soup = BeautifulSoup(page.content, 'html.parser')
      soup.prettify()
      info=[]
      input_output_list = soup.find_all('tr')
      for l in input_output_list:
        if dist in l.get_text():
          for el in l.get_text().split('\n'):
            if(len(el)>0):
              info.append(el)
      ret = dist +' '+ info[2]+' '+info[3]+' '+info[4]+' '+info[5]
      return ret
    except:
      return '-1'

dist = sys.argv[1]
print(findOnline(dist))
  