'''
Created on Dec 24, 2019

@author: hitpony
'''
#1. https://blog.csdn.net/qq_40527086/article/details/94715755
#2. 后台选Project: ModAccessCom.py: GL_PRJ_CUR_SET              = GL_PRJ_SET_SUUA
#3. ModUbootUartAccess.py, serialFd = serial.Serial(port=serialName, baudrate=115200, bytesize=8, parity=serial.PARITY_EVEN, stopbits=1, timeout=1)


import serial
import serial.tools.list_ports
import datetime
import sys
import time
import json
import os
import re
import urllib
import http
import socket
import hashlib
import ctypes 
import string
import random
import threading
import struct
import pycurl
import time
import urllib3
import requests
from ctypes import *
import numpy as np
import math
import binascii
import xlwings as xhbet
from distributed.diagnostics.progressbar import progress

_SPSCARD_PORT_DESC1 = 'USB-SERIAL CH340'
_SPSCARD_PORT_DESC2 = 'Silicon Labs CP210x USB to UART Bridge'
_SPSCARD_PORT_DESC = _SPSCARD_PORT_DESC2
_STM32F2_ACK = 0x79
_STM32F2_NACK = 0x1F
_STM32F2_ROM_START = 0x8000000
_STM32F2_RAM_START = 0x20000000
_STM32F2_BOOT = [0x7F]
_STM32F2_GETS = [0x00, 0xFF]
_STM32F2_GETS_RPS = [0x01, 0xFE]
_STM32F2_GETID = [0x02, 0xFD]
_STM32F2_READMEM = [0x11, 0xEE]
_STM32F2_GO = [0x21, 0xDE]
_STM32F2_WRITEMEM = [0x31, 0xCE]
_STM32F2_ERASE = [0x43, 0xBC]
_STM32F2_EXTERASE = [0x44, 0xBB]
_STM32F2_WRITEPROT = [0x63, 0x9C]
_STM32F2_WRITEUNP = [0x73, 0x8C]        #UNPROTECTION
_STM32F2_READOUT_PROT = [0x82, 0x7D]
_STM32F2_READOUT_UNP = [0x92, 0x6D]     #UNPROTECTION

_STM32_FLASH_CONFIG = {"STM32F207": {"nbrPages": 12, "pagesList": list(range(12))  }, 
                       "STM32L051": {"nbrPages":512, "pagesList": list(range(512)) },
                       "STM32F407": {"nbrPages": 12, "pagesList": list(range(12)) } }

_STM32_FLASH_ERASE_PAGE_NUM_MASS_ERASE  = 0xFFFF
_STM32_FLASH_ERASE_PAGE_NUM_BANK1_ERASE = 0xFFFE
_STM32_FLASH_ERASE_PAGE_NUM_BANK2_ERASE = 0xFFFD

_STM32_MAX_BYTES_TO_WRITE = 256
_STM32_MAX_BYTES_TO_READ  = 255





class classUbootUartAccessRomote():
    def __init__(self):
        pass
#         print(111111)
#         serialFd = self.func_stm32f2_sps_init()
#         if serialFd == '':
#             return -1,'Uart Port Error!'
#         print(serialFd)
        self.contents = ''
        self.IsReadProtectEnabled = False
        self.IsWriteProtectEnabled = False
        self.IsExtendedEraseEnabled = False        
    def callback(self,curl):
        self.contents = self.contents + curl.decode('utf-8')

    #HTTP CONNECT
    def hst_curl_client_connection(self):
        t = classUbootUartAccessRomote()
        c = pycurl.Curl()
        c.setopt(pycurl.WRITEFUNCTION, t.callback)
        c.setopt(pycurl.ENCODING, 'gzip')
        c.setopt(pycurl.URL, "http://192.168.1.141:7999")
        c.setopt(pycurl.FORBID_REUSE, 0)
        #self.recSocket.setsockopt(socket.SOL_SOCKET,socket.SO_REUSEADDR,1)      
        c.perform()
        NAMELOOKUP_TIME =  c.getinfo(c.NAMELOOKUP_TIME)
        CONNECT_TIME =  c.getinfo(c.CONNECT_TIME)
        PRETRANSFER_TIME =   c.getinfo(c.PRETRANSFER_TIME)
        STARTTRANSFER_TIME = c.getinfo(c.STARTTRANSFER_TIME)
        TOTAL_TIME = c.getinfo(c.TOTAL_TIME)
        HTTP_CODE =  c.getinfo(c.HTTP_CODE)
        SIZE_DOWNLOAD =  c.getinfo(c.SIZE_DOWNLOAD)
        HEADER_SIZE = c.getinfo(c.HEADER_SIZE)
        SPEED_DOWNLOAD=c.getinfo(c.SPEED_DOWNLOAD)
        print("HTTP状态码：%s" %(HTTP_CODE))
        print("DNS解析时间：%.2f ms"%(NAMELOOKUP_TIME*1000))
        print("建立连接时间：%.2f ms" %(CONNECT_TIME*1000))
        print("准备传输时间：%.2f ms" %(PRETRANSFER_TIME*1000))
        print("传输开始时间：%.2f ms" %(STARTTRANSFER_TIME*1000))
        print("传输结束总时间：%.2f ms" %(TOTAL_TIME*1000))
        print("下载数据包大小：%d bytes/s" %(SIZE_DOWNLOAD))
        print("HTTP头部大小：%d byte" %(HEADER_SIZE))
        print("平均下载速度：%d bytes/s" %(SPEED_DOWNLOAD))
        c.close()
    
    #以curlib3为方式的client连接 - 主要应用模式
    def hst_curlib3_client_connection(self, jsonInputData, logic):
            encoded_data = json.dumps(jsonInputData).encode('utf-8')
            print(encoded_data)
            http = urllib3.PoolManager(maxsize=10, timeout=100.0, block=True)
            r = http.request(
                'POST',
                'http://192.168.1.141:7999/post',
                body=encoded_data, 
                headers={'Content-Type':'application/json', 'Connection': 'close'}
                )
            # print("r data")
            # print(r.data)
            # result=''
            try:
                result = json.loads(r.data)
                #print(result)
            except Exception:
                print("Test case run error without feedback, fill with default failure")
                result = {"restTag": "suua", "actionId": 30001, "parFlag": 1, "parContent": {"status": -2, "result": -2, "hex": ""}}
            #ptr.assertEqual(result['parContent']['sucFlag'], logic, 'Result Failure')
            return result
    
    #带校验的工作模式
    def hst_curlib3_client_conn_check_details(self, ptr, jsonInputData, logic):
            encoded_data = json.dumps(jsonInputData).encode('utf-8')
            http = urllib3.PoolManager(maxsize=10, block=True)
            r = http.request(
                'POST',
                'http://192.168.1.141:7999/post',
                body=encoded_data,
                headers={'Content-Type':'application/json'})
            result = json.loads(r.data)
            ptr.assertEqual(result['parFlag'], logic, 'Result Failure')
            #return result['parContent']
            return result
    # DJZ HST pycurl function
    def hst_pycurl_client_connection(self, url, inputData):
        import io
        postData=json.dumps(inputData)
        curl = pycurl.Curl()
        curl.setopt(pycurl.URL, url)
        curl.setopt(pycurl.POSTFIELDS, postData)
        curl.setopt(pycurl.HEADER, 0)
        curl.setopt(pycurl.TIMEOUT, 30)
        buf = io.BytesIO()
        curl.setopt(pycurl.WRITEFUNCTION, buf.write)
        curl.perform()
        curl.close()
        curlData = json.loads(buf.getvalue(), encoding='utf8')
        print(curlData)
        return curlData
    

    def ubootUartAccessRemote_StartUboot(self):
        ticks = time.time();
        print("ubootUartAccessRemote_start_com, time in second = ", ticks);
        jsonInputData = {
            'restTag': 'suua', 
            'actionId': 30001, 
            'parFlag': 1, 
            'parContent': {'cmd': 'start_comm', 'para': {'timeOutCnt': 30,}}
            }
        result = self.hst_curlib3_client_connection(jsonInputData, 1)
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
#         print(parContentResult)
#         print(parContentHex) 
        return parContentResult, parContentHex
        
    def ubootUartAccessRemote_Get(self):
        ticks = time.time();
        print("ubootUartAccessRemote_gets, time in second = ", ticks);
        jsonInputData = {
            'restTag': 'suua', 
            'actionId': 30001, 
            'parFlag': 1, 
            'parContent': {'cmd': 'gets', 'para': {'timeOutCnt': 30,}}
            }
        result = self.hst_curlib3_client_connection(jsonInputData, 1)
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
        if parContentHex[18:20] == '44':
            self.IsExtendedEraseEnabled = True
        elif parContentHex[18:20] == '43':
            self.IsExtendedEraseEnabled = False
        print("IsExtendedEraseEnabled =", self.IsExtendedEraseEnabled)
#         print(parContentResult)
#         print(parContentHex) 
        return parContentResult, parContentHex

    def ubootUartAccessRemote_GetVersionRDPStatus(self):
        ticks = time.time();
        print("ubootUartAccessRemote_GetVersionRDPStatus, time in second = ", ticks);
        jsonInputData = {
            'restTag': 'suua', 
            'actionId': 30001, 
            'parFlag': 1, 
            'parContent': {'cmd': 'get_version_rdp_status', 'para': {'timeOutCnt': 30,}}
            }
        result = self.hst_curlib3_client_connection(jsonInputData, 1)
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
#         print(parContentResult)
#         print(parContentHex) 
        return parContentResult, parContentHex    
                
    def ubootUartAccessRemote_GetID(self):
        ticks = time.time();
        print("ubootUartAccessRemote_GetID, time in second = ", ticks);
        jsonInputData = {'restTag': 'suua', 
                 'actionId': 30001, 
                 'parFlag': 1, 
                 'parContent': {'cmd': 'getid', 'para': {'timeOutCnt': 30,}}
                 }
        result = self.hst_curlib3_client_connection(jsonInputData, 1)
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
#         print(parContentResult)
#         print(parContentHex) 
        return parContentResult, parContentHex         
        
        
    def ubootUartAccessRemote_Go(self, address):
        ticks = time.time();
        print("ubootUartAccessRemote_Go, time in second = ", ticks);
        jsonInputData = {'restTag': 'suua', 
                 'actionId': 30001, 
                 'parFlag': 1, 
                 'parContent': {'cmd': 'gomem', 'para': {'timeOutCnt': 30,'goExecAddr': 0}}
                 }
        jsonInputData['parContent']['para']['goExecAddr'] = address
        result = self.hst_curlib3_client_connection(jsonInputData, 1)      
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
#         print(parContentResult)
#         print(parContentHex) 
        return parContentResult, parContentHex
        
    def ubootUartAccessRemote_ReadoutUnprotect(self):
        ticks = time.time();
        print("ubootUartAccessRemote_ReadoutUnprotect, time in second = ", ticks);
        jsonInputData = {'restTag': 'suua', 
                 'actionId': 30001, 
                 'parFlag': 1, 
                 'parContent': {'cmd': 'read_unprotect', 'para': {'timeOutCnt': 30,}}
                 }
        result = self.hst_curlib3_client_connection(jsonInputData, 1)       
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
        if parContentResult == 1:
            self.IsReadProtectEnabled = False
        print("IsReadProtectEnabled =", self.IsReadProtectEnabled)
#         print(parContentResult)
#         print(parContentHex)         
        return parContentResult, parContentHex    
    
    def ubootUartAccessRemote_ReadoutProtect(self):
        ticks = time.time();
        print("ubootUartAccessRemote_ReadoutProtect, time in second = ", ticks);
        jsonInputData = {'restTag': 'suua', 
                 'actionId': 30001, 
                 'parFlag': 1, 
                 'parContent': {'cmd': 'read_protect', 'para': {'timeOutCnt': 30,}}
                 }
        result = self.hst_curlib3_client_connection(jsonInputData, 1)      
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
        if parContentResult == 1:
            self.IsReadProtectEnabled = True
        print("IsReadProtectEnabled =", self.IsReadProtectEnabled)        
#         print(parContentResult)
#         print(parContentHex)         
        return parContentResult, parContentHex        
        
    def ubootUartAccessRemote_WriteProtect(self, sectorList):
        ticks = time.time();
        print("ubootUartAccessRemote_WriteProtect, time in second = ", ticks);
        jsonInputData = {'restTag': 'suua', 
                 'actionId': 30001, 
                 'parFlag': 1, 
                 'parContent': {'cmd': 'write_protect', 'para': {'timeOutCnt': 30,'sectorList': [1,2]}}
                 }
        jsonInputData['parContent']['para']['sectorList'] = sectorList
        result = self.hst_curlib3_client_connection(jsonInputData, 1)       
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
        if parContentResult == 1:
            self.IsWriteProtectEnabled = True
        print("IsWriteProtectEnabled =", self.IsWriteProtectEnabled)        
#         print(parContentResult)
#         print(parContentHex)  
        return parContentResult, parContentHex      
        
    def ubootUartAccessRemote_WriteUnprotect(self):
        ticks = time.time();
        print("ubootUartAccessRemote_WriteUnprotect, time in second = ", ticks);
        jsonInputData = {'restTag': 'suua', 
                 'actionId': 30001, 
                 'parFlag': 1, 
                 'parContent': {'cmd': 'write_unprotect', 'para': {'timeOutCnt': 30,}}
                 }
        result = self.hst_curlib3_client_connection(jsonInputData, 1)      
        parContentResult = result['parContent']['result']
        parContentHex = result['parContent']['hex']
        if parContentResult == 1:
            self.IsWriteProtectEnabled = False
        print("IsWriteProtectEnabled =", self.IsWriteProtectEnabled)     
#         print(parContentResult)
#         print(parContentHex) 
        return parContentResult, parContentHex       
        
    def ubootUartAccessRemote_ReadMemory(self, addr, nbrRead):
        ticks = time.time();
        print("ubootUartAccessRemote_ReadMemory, time in second = ", ticks);
        jsonInputData = {'restTag': 'suua', 
                 'actionId': 30001, 
                 'parFlag': 1, 
                 'parContent': {'cmd': 'readmem', 'para': {'timeOutCnt': 30,'addr': 0x8000000 + 0x20, 'nbrRead': 1}}
                 }
        jsonInputData['parContent']['para']['addr'] = addr
        jsonInputData['parContent']['para']['nbrRead'] = nbrRead
        result = self.hst_curlib3_client_connection(jsonInputData, 1)
        ticks = time.time();
        #print("ubootUartAccessRemote_ReadMemory OUT, time in second = ", ticks);       
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
#         print(parContentResult)
#         print(parContentHex)
        return parContentResult, parContentHex
        
    def ubootUartAccessRemote_Erase(self, nbrPages, pagesList):
        ticks = time.time();
        print("ubootUartAccessRemote_Erase, time in second = ", ticks);
        jsonInputData = {'restTag': 'suua', 
                 'actionId': 30001, 
                 'parFlag': 1, 
                 'parContent': {'cmd': 'erasemem', 'para': {'timeOutCnt': 90,'nbrPages': 4, 'pagesList': [1,2]}}
                 }
        jsonInputData['parContent']['para']['nbrPages'] = nbrPages
        jsonInputData['parContent']['para']['pagesList'] = pagesList        
        result = self.hst_curlib3_client_connection(jsonInputData, 1)      
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
#         print(parContentResult)
#         print(parContentHex)  
        return parContentResult, parContentHex      
        
    def ubootUartAccessRemote_ExtendedErase(self, nbrPages, pagesList):
        ticks = time.time();
        print("ubootUartAccessRemote_ExtendedErase, time in second = ", ticks);
        jsonInputData = {'restTag': 'suua', 
                 'actionId': 30001, 
                 'parFlag': 1, 
                 'parContent': {'cmd': 'extEraseMem', 'para': {'timeOutCnt': 90,'nbrPages': 2, 'pagesList': [0x0001, 0x0002]}}
                 }
        jsonInputData['parContent']['para']['nbrPages'] = nbrPages
        jsonInputData['parContent']['para']['pagesList'] = pagesList        
        result = self.hst_curlib3_client_connection(jsonInputData, 1)       
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
#         print(parContentResult)
#         print(parContentHex) 
        return parContentResult, parContentHex

    def ubootUartAccessRemote_EraseSimple(self, nbrPages, pagesList):
        ticks = time.time();
        print("ubootUartAccessRemote_EraseSimple, time in second = ", ticks)
        
        if self.IsExtendedEraseEnabled == True:
            print("ubootUartAccessRemote_EraseSimple, Call ubootUartAccessRemote_ExtendedErase")
            return self.ubootUartAccessRemote_ExtendedErase(nbrPages, pagesList)
        else:
            print("ubootUartAccessRemote_EraseSimple, Call ubootUartAccessRemote_ExtendedErase")
            return self.ubootUartAccessRemote_Erase(nbrPages, pagesList)
              
    def ubootUartAccessRemote_EraseFullChip(self):
        ticks = time.time();
        print("ubootUartAccessRemote_EraseFullChip, time in second = ", ticks)

        nbrPages =  _STM32_FLASH_ERASE_PAGE_NUM_MASS_ERASE
        pagesList = [0]
        if self.IsExtendedEraseEnabled == True:
            print("ubootUartAccessRemote_EraseFullChip, Call ubootUartAccessRemote_ExtendedErase")
            return self.ubootUartAccessRemote_ExtendedErase(nbrPages, pagesList)
        else:
            print("ubootUartAccessRemote_EraseFullChip, Call ubootUartAccessRemote_ExtendedErase")
            return self.ubootUartAccessRemote_Erase(nbrPages, pagesList)
    
    def ubootUartAccessRemote_WriteMemory(self, addr, byteArray):
        ticks = time.time();
        print("ubootUartAccessRemote_WriteMemory, time in second = ", ticks);
        jsonInputData = {'restTag': 'suua', 
                 'actionId': 30001, 
                 'parFlag': 1, 
                 'parContent': {'cmd': 'writemem', 'para': {'timeOutCnt': 30,'addr':  0x8000000 + 0x20,'byteArray': [0x1A, 0x1B, 0x1C, 0x1D]}}
                 }
        jsonInputData['parContent']['para']['addr'] = addr
        jsonInputData['parContent']['para']['byteArray'] = byteArray
        result = self.hst_curlib3_client_connection(jsonInputData, 1)        
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
#         print(parContentResult)
#         print(parContentHex)
        return parContentResult, parContentHex
                
    def ubootUartAccessRemote_EnterBootload(self):
        ticks = time.time();
        print("ubootUartAccessRemote_EnterBootload, time in second = ", ticks);
        jsonInputData = {
            'restTag': 'suua', 
            'actionId': 30001, 
            'parFlag': 1, 
            'parContent': {'cmd': 'enter_bootload', 'para': {'timeOutCnt': 30,}}
            }
        result = self.hst_curlib3_client_connection(jsonInputData, 1)               
        parContentResult =  result['parContent']['result']
        parContentHex = result['parContent']['hex']
#         print(parContentResult)
#         print(parContentHex)
        return parContentResult, parContentHex
    
    def ubootUartAccessRemote_SaveFlashToFile(self, filename, base_addr, size_in_byes):
        fp = open(filename,'w+b')
        file = b''
        read_flash_offset = int(0)
        next_len_to_read = int(_STM32_MAX_BYTES_TO_READ);
        while(read_flash_offset < size_in_byes):
            result, hex = self.ubootUartAccessRemote_ReadMemory(base_addr + read_flash_offset, next_len_to_read)
            #print(len(result), result)
            read_flash_offset = read_flash_offset + int(len(result) / 2)
            
            if read_flash_offset + _STM32_MAX_BYTES_TO_READ > size_in_byes:                
                next_len_to_read = int(size_in_byes - read_flash_offset)
            else:
                next_len_to_read = int(_STM32_MAX_BYTES_TO_READ)
            print("read_flash_offset=", read_flash_offset, ", next_len_to_read=", next_len_to_read, ", progress={:.2f}".format(100*read_flash_offset/size_in_byes), "%")    
            y = bytearray.fromhex(result)  #https://www.jianshu.com/p/7136b47fdd33
            file = file + y
                        
        #file_int_list = [ord(c) for c in file]
        #print(file)    
        fp.write(file)
        fp.close()
        file_size = GetFileSize(filename)
        if(file_size == size_in_byes):
            print("ubootUartAccessRemote_SaveFlashToFile: Save file OK, Saved ", file_size, " Bytes")
            return True, file_size
        else:
            print("ubootUartAccessRemote_SaveFlashToFile: Save file KO, Saved ", file_size, " Bytes")
            return False, file_size
        
    def ubootUartAccessRemote_WriteMemoryFromFile(self, filename, base_addr, size_in_byes, Verify):
        print("ubootUartAccessRemote_WriteMemoryFromFile, ", filename, "Size=", size_in_byes, "bytes to write at ", base_addr)
        file_size = GetFileSize(filename)
        file_read_list = []
        
        if file_size > 0:
            fp = open(filename,'r+b')
            file_read_bytes = fp.read()
            size_to_save = min(size_in_byes, file_size)
            for i in range(size_to_save):
                file_read_list.append(file_read_bytes[i] & 0xFF)
        
        #print(file_read_bytes)
        #print(file_read_list)
        print("ubootUartAccessRemote_WriteMemoryFromFile, Call ubootUartAccessRemote_WriteMemoryFromList")
        ret, fb = self.ubootUartAccessRemote_WriteMemoryFromList(base_addr, file_read_list, Verify)
        print(ret, fb)
        return ret, fb
            
    def ubootUartAccessRemote_WriteMemoryFromList(self, base_addr, byteArray, Verify):
        total_len_of_array = len(byteArray)
        len_per_write = int(0)
        total_len_of_already_writen = int(0)
        
        print("ubootUartAccessRemote_WriteMemoryFromList", total_len_of_array, " bytes to write at ", base_addr)
        
        if total_len_of_array <= _STM32_MAX_BYTES_TO_WRITE:
            len_per_write = total_len_of_array
        else:
            len_per_write = _STM32_MAX_BYTES_TO_WRITE
        
        #START TO WRITE    
        while (total_len_of_already_writen < total_len_of_array):
            byteSegment = byteArray[total_len_of_already_writen:total_len_of_already_writen+len_per_write]
            
            result = self.ubootUartAccessRemote_WriteMemory(base_addr + total_len_of_already_writen, byteSegment)
            
            if result[0] != 121:
                print("ubootUartAccessRemote_WriteMemoryFromList, Return Error from Server")
                return False, total_len_of_already_writen
            
            total_len_of_already_writen = total_len_of_already_writen + len_per_write
            
            print("ubootUartAccessRemote_WriteMemoryFromList, addr_offset=", total_len_of_already_writen, "len_per_write=", len_per_write, "lenSeg=", len(byteSegment), "progress=", (100*total_len_of_already_writen/total_len_of_array), "%")
            
            
            if total_len_of_already_writen + _STM32_MAX_BYTES_TO_WRITE > total_len_of_array:
                len_per_write = total_len_of_array - total_len_of_already_writen
            else:
                len_per_write = _STM32_MAX_BYTES_TO_WRITE
                
        # VERIFICATION CHECK
        if Verify == True:
            print("ubootUartAccessRemote_WriteMemoryFromList, Start verifying ...")
            read_len = int(0)
            read_back_str = ''
            read_per_time = int(0)
            while (read_len < total_len_of_array):                
                if (read_len + _STM32_MAX_BYTES_TO_READ) < total_len_of_array:
                    read_per_time = _STM32_MAX_BYTES_TO_READ
                else:
                    read_per_time = total_len_of_array - read_len
                    
                fb, hex = self.ubootUartAccessRemote_ReadMemory(base_addr + read_len, read_per_time)
                #print(fb)
                read_len = read_len + int(len(fb)/2)
                read_back_str = read_back_str + fb
                
                print("ubootUartAccessRemote_WriteMemoryFromList, addr_offset=", read_len, "len_per_verify=", read_per_time, "progress=", (100*read_len/total_len_of_array), "%")
               
            read_back_list = list(bytes.fromhex(read_back_str))
            #print(read_back_list)
            
            if (read_back_list == byteArray):
                print("ubootUartAccessRemote_WriteMemoryFromList, Verify OK")
                return True, total_len_of_already_writen
            else:
                print("ubootUartAccessRemote_WriteMemoryFromList, Verify NOK")
                return False, total_len_of_already_writen
                
        else: # NO VERIFICATION
            print("ubootUartAccessRemote_WriteMemoryFromList, Completed, No Verify")                      
            return True, total_len_of_already_writen
        
    
def ubootUartAccessRemote_Procedure_Connect():
    print("ubootUartAccessRemote_Procedure_Connect, Start")
    ResultGet = ''
    ResultGetVersionRDPStatus = ''
    ResultGetID = ''
    
    cuuar = classUbootUartAccessRomote()
    result = cuuar.ubootUartAccessRemote_StartUboot()
    print(result)
    if result[0] == -2 or result[0] == -1:
        print("ubootUartAccessRemote_StartUboot, NOK")
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID

    result = cuuar.ubootUartAccessRemote_Get()
    print(result)
    if result[0] == -2 or result[0] == -1:
        print("ubootUartAccessRemote_Get, NOK")
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    ResultGet = result[1]

    result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
    print(result)
    if result[0] == -2 or result[0] == -1:
        print("ubootUartAccessRemote_GetVersionRDPStatus, NOK")
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    ResultGetVersionRDPStatus = result[1]
    
    result = cuuar.ubootUartAccessRemote_GetID()
    print(result)
    if result[0] == -2 or result[0] == -1:
        print("ubootUartAccessRemote_GetID, NOK")
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    ResultGetID = result[1]

    result = cuuar.ubootUartAccessRemote_ReadoutUnprotect()
    print(result)
    if result[0] == -2 or result[0] == -1:
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID

    result = cuuar.ubootUartAccessRemote_StartUboot()
    print(result)
    if result[0] == -2 or result[0] == -1:
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID

    result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
    print(result)          
    if result[0] == -2 or result[0] == -1:
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    ResultGetVersionRDPStatus = result[1]

    result = cuuar.ubootUartAccessRemote_WriteUnprotect()
    print(result)
    if result[0] == -2 or result[0] == -1:
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID

    result = cuuar.ubootUartAccessRemote_StartUboot()
    print(result)
    if result[0] == -2 or result[0] == -1:
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID

    result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
    print(result)
    if result[0] == -2 or result[0] == -1:
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    ResultGetVersionRDPStatus = result[1]
        
    print("ubootUartAccessRemote_Procedure_Connect, OK", "Get=", ResultGet, "VersionRDPStatus=", ResultGetVersionRDPStatus, "GetID=", ResultGetID)
    return True, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    
def ubootUartAccessRemote_Procedure_EraseFullChip():
    print("ubootUartAccessRemote_Procedure_EraseFullChip, Start")
    cuuar = classUbootUartAccessRomote()
    
    result = cuuar.ubootUartAccessRemote_Get()
    print(result)
    if result[0] == -2 or result[0] == -1:
        print("ubootUartAccessRemote_Get, NOK")
        return False
    
    result = cuuar.ubootUartAccessRemote_EraseFullChip()
    print(result)
    if result[0] != 121:
        return False

    result = cuuar.ubootUartAccessRemote_StartUboot()
    print(result)
    if result[0] == -2 or result[0] == -1:
        return False

    return True

def ubootUartAccessRemote_Procedure_ErasePages(pagesList):
    print("ubootUartAccessRemote_Procedure_ErasePages, Start")
    nbrPages = len(pagesList)
    cuuar = classUbootUartAccessRomote()
    
    result = cuuar.ubootUartAccessRemote_Get()
    print(result)
    if result[0] == -2 or result[0] == -1:
        print("ubootUartAccessRemote_Get, NOK")
        return False
    
    result = cuuar.ubootUartAccessRemote_EraseSimple(nbrPages, pagesList)
    print(result)
    if result[0] != 121:
        return False

    result = cuuar.ubootUartAccessRemote_StartUboot()
    print(result)
    if result[0] == -2 or result[0] == -1:
        return False

    return True

    
def ubootUartAccessRemote_Procedure_SaveFlashToFile(filename, base_addr, size_in_byes):
    print("ubootUartAccessRemote_Procedure_SaveFlashToFile, Start")
    cuuar = classUbootUartAccessRomote()
    result = cuuar.ubootUartAccessRemote_SaveFlashToFile(filename, base_addr, size_in_byes)
    print(result)
    return result              

def ubootUartAccessRemote_Procedure_WriteMemoryFromFile(filename, base_addr, size_in_byes):
    print("ubootUartAccessRemote_Procedure_WriteMemoryFromFile, Start")
    cuuar = classUbootUartAccessRomote()
    result = cuuar.ubootUartAccessRemote_WriteMemoryFromFile(filename, base_addr, size_in_byes, True)
    print(result)
    return result              

def ubootUartAccessRemote_Procedure_ReadMemory(base_addr, size_in_byes):
    print("ubootUartAccessRemote_Procedure_ReadMemory, Start")
    cuuar = classUbootUartAccessRomote()
    read_len = int(0)
    read_back_str = ''
    read_per_time = int(0)
    while (read_len < size_in_byes):                
        if (read_len + _STM32_MAX_BYTES_TO_READ) < size_in_byes:
            read_per_time = _STM32_MAX_BYTES_TO_READ
        else:
            read_per_time = size_in_byes - read_len
            
        fb, hex = cuuar.ubootUartAccessRemote_ReadMemory(base_addr + read_len, read_per_time)
        #print(fb)
        read_len = read_len + int(len(fb)/2)
        read_back_str = read_back_str + fb
       
    read_back_list = list(bytes.fromhex(read_back_str))
    #print(read_back_list)
    return True, read_back_list

#################################################################
#################################################################
#################################################################
#################################################################
def GetFileSize(filename):
    try:
        filesize = os.path.getsize(filename)
    except FileNotFoundError:
        filesize = 0
    return filesize

def LEFT_OF_POS(position):
    collumn = position[0:1]
    #print(collumn)
    collumn_left_i = ord(collumn)-1
    if collumn_left_i < ord('A'):
        collumn_left_i = ord('A')
    #print(collumn_left_i)    
    collumn_left_str = chr(collumn_left_i) + position[1:]
    #print(collumn_left_str)
    return collumn_left_str    

def XY2POS(p):    
    return chr(65+p[0]-1) + str(p[1]) 

def XhBet_Find_Position(name, sht):
    for i in range(100):
        cc = sht.range(XY2POS([2, i+1])).value
        if cc == name:
            break
    
    if i == 99:
        return [20, 1]
    
    return [2, i+1]

def Xhbet_2Dim_Add(x, y):
    return [x[0]+y[0], x[1]+y[1]]    

def ubootUartAccessRemote_XhBet_Connect():
    
    # XHBET INTERFACE
    _XHBET_CONNECT_PROGRESS_OFFSET = [8, 0]
    _XHBET_CONNECT_STATUS_OFFSET = [9, 0]
    _XHBET_CONNECT_GET = 'N4'
    _XHBET_CONNECT_GETID = 'N5'
    _XHBET_CONNECT_VERRDP = 'N6'    
    
    wb = xhbet.Book.caller()
    sht = xhbet.sheets[0]
    #curr_time = datetime.datetime.now()
    #time_str = datetime.datetime.strftime(curr_time,'%Y-%m-%d %H:%M:%S')
    _XHBET_CONNECT_BASE = XhBet_Find_Position("connect", sht)
    _XHBET_CONNECT_PROGRESS = XY2POS(Xhbet_2Dim_Add(_XHBET_CONNECT_BASE, _XHBET_CONNECT_PROGRESS_OFFSET)) 
    _XHBET_CONNECT_STATUS  =  XY2POS(Xhbet_2Dim_Add(_XHBET_CONNECT_BASE, _XHBET_CONNECT_STATUS_OFFSET))  
    
    sht.range(_XHBET_CONNECT_GET).value = _XHBET_CONNECT_PROGRESS
    sht.range(_XHBET_CONNECT_GETID).value = _XHBET_CONNECT_STATUS
    
    #.................
    #..... START .....
    #.................
    sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
    sht.range(_XHBET_CONNECT_STATUS).value = "Connecting"
        
    print("ubootUartAccessRemote_XhBet_Connect, Start")
    ResultGet = ''
    ResultGetVersionRDPStatus = ''
    ResultGetID = ''
    
    cuuar = classUbootUartAccessRomote()
    result = cuuar.ubootUartAccessRemote_StartUboot()
    print(result)
    if result[0] == -2 or result[0] == -1:
        print("ubootUartAccessRemote_StartUboot, NOK")
        sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
        sht.range(_XHBET_CONNECT_STATUS).value = "Timeout NOK"
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
 
    sht.range(_XHBET_CONNECT_PROGRESS).value = "10%"
    result = cuuar.ubootUartAccessRemote_Get()
    print(result)
    if result[0] == -2 or result[0] == -1:
        print("ubootUartAccessRemote_Get, NOK")
        sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
        sht.range(_XHBET_CONNECT_STATUS).value = "Timeout NOK"        
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    ResultGet = result[1]
 
    sht.range(_XHBET_CONNECT_PROGRESS).value = "20%"
    result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
    print(result)
    if result[0] == -2 or result[0] == -1:
        print("ubootUartAccessRemote_GetVersionRDPStatus, NOK")
        sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
        sht.range(_XHBET_CONNECT_STATUS).value = "Timeout NOK"        
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    ResultGetVersionRDPStatus = result[1]
     
    sht.range(_XHBET_CONNECT_PROGRESS).value = "30%"
    result = cuuar.ubootUartAccessRemote_GetID()
    print(result)
    if result[0] == -2 or result[0] == -1:
        print("ubootUartAccessRemote_GetID, NOK")
        sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
        sht.range(_XHBET_CONNECT_STATUS).value = "Timeout NOK"        
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    ResultGetID = result[1]
 
    sht.range(_XHBET_CONNECT_PROGRESS).value = "50%"
    result = cuuar.ubootUartAccessRemote_ReadoutUnprotect()
    print(result)
    if result[0] == -2 or result[0] == -1:
        sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
        sht.range(_XHBET_CONNECT_STATUS).value = "Timeout NOK"        
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
 
    sht.range(_XHBET_CONNECT_PROGRESS).value = "60%"
    result = cuuar.ubootUartAccessRemote_StartUboot()
    print(result)
    if result[0] == -2 or result[0] == -1:
        sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
        sht.range(_XHBET_CONNECT_STATUS).value = "Timeout NOK"        
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
 
    sht.range(_XHBET_CONNECT_PROGRESS).value = "70%"
    result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
    print(result)          
    if result[0] == -2 or result[0] == -1:
        sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
        sht.range(_XHBET_CONNECT_STATUS).value = "Timeout NOK"        
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    ResultGetVersionRDPStatus = result[1]
 
    sht.range(_XHBET_CONNECT_PROGRESS).value = "80%"
    result = cuuar.ubootUartAccessRemote_WriteUnprotect()
    print(result)
    if result[0] == -2 or result[0] == -1:
        sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
        sht.range(_XHBET_CONNECT_STATUS).value = "Timeout NOK"        
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
 
    sht.range(_XHBET_CONNECT_PROGRESS).value = "90%"
    result = cuuar.ubootUartAccessRemote_StartUboot()
    print(result)
    if result[0] == -2 or result[0] == -1:
        sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
        sht.range(_XHBET_CONNECT_STATUS).value = "Timeout NOK"        
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
 
    sht.range(_XHBET_CONNECT_PROGRESS).value = "95%"
    result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
    print(result)
    if result[0] == -2 or result[0] == -1:
        sht.range(_XHBET_CONNECT_PROGRESS).value = "0%"
        sht.range(_XHBET_CONNECT_STATUS).value = "Timeout NOK"        
        return False, ResultGet, ResultGetVersionRDPStatus, ResultGetID
    ResultGetVersionRDPStatus = result[1]
 
    sht.range(_XHBET_CONNECT_PROGRESS).value = "100%"
    sht.range(_XHBET_CONNECT_STATUS).value = "OK"
    sht.range(_XHBET_CONNECT_GET).value = "GET=" + ResultGet
    sht.range(_XHBET_CONNECT_GETID).value = "GETID=" + ResultGetID
    sht.range(_XHBET_CONNECT_VERRDP).value = "VERPDP=" + ResultGetVersionRDPStatus
    print("ubootUartAccessRemote_Procedure_Connect, OK", "Get=", ResultGet, "VersionRDPStatus=", ResultGetVersionRDPStatus, "GetID=", ResultGetID)
    return True, ResultGet, ResultGetVersionRDPStatus, ResultGetID

def ubootUartAccessRemote_XhBet_EraseFullChip():
    print("ubootUartAccessRemote_Procedure_EraseFullChip, Start")
    
    _XHBET_ERASEFULLCHIP_PROGRESS_OFFSET = [8, 0]
    _XHBET_ERASEFULLCHIP_STATUS_OFFSET = [9, 0]
    _XHBET_CONNECT_GET = 'N4'
    _XHBET_CONNECT_GETID = 'N5'
    _XHBET_ERASEFULLCHIP_PROGRESS = 'I10'
    _XHBET_ERASEFULLCHIP_STATUS = 'J10'

    wb = xhbet.Book.caller()
    sht = xhbet.sheets[0]
    #curr_time = datetime.datetime.now()
    #time_str = datetime.datetime.strftime(curr_time,'%Y-%m-%d %H:%M:%S')
    
    _XHBET_ERASEFULLCHIP_BASE = XhBet_Find_Position("erase", sht)
    _XHBET_ERASEFULLCHIP_PROGRESS = XY2POS(Xhbet_2Dim_Add(_XHBET_ERASEFULLCHIP_BASE, _XHBET_ERASEFULLCHIP_PROGRESS_OFFSET)) 
    _XHBET_ERASEFULLCHIP_STATUS  =  XY2POS(Xhbet_2Dim_Add(_XHBET_ERASEFULLCHIP_BASE, _XHBET_ERASEFULLCHIP_STATUS_OFFSET))  
    
    #.................
    #..... START .....
    #.................    
    sht.range(_XHBET_ERASEFULLCHIP_PROGRESS).value = "0%"
    sht.range(_XHBET_ERASEFULLCHIP_STATUS).value = "Prepare..."    
    cuuar = classUbootUartAccessRomote()
    
    result = cuuar.ubootUartAccessRemote_Get()
    print(result)
    if result[0] == -2 or result[0] == -1:
        sht.range(_XHBET_ERASEFULLCHIP_PROGRESS).value = "0%"
        sht.range(_XHBET_ERASEFULLCHIP_STATUS).value = "Prepare NOK"  
        print("ubootUartAccessRemote_Get, NOK")
        return False

    sht.range(_XHBET_ERASEFULLCHIP_PROGRESS).value = "1...99%"
    sht.range(_XHBET_ERASEFULLCHIP_STATUS).value = "Erasing..."      
    result = cuuar.ubootUartAccessRemote_EraseFullChip()
    print(result)
    if result[0] != 121:
        sht.range(_XHBET_ERASEFULLCHIP_PROGRESS).value = "0"
        sht.range(_XHBET_ERASEFULLCHIP_STATUS).value = "Erase NOK"      
        return False

    sht.range(_XHBET_ERASEFULLCHIP_PROGRESS).value = "99%"
    sht.range(_XHBET_ERASEFULLCHIP_STATUS).value = "Completing"   
    result = cuuar.ubootUartAccessRemote_StartUboot()
    print(result)
    if result[0] == -2 or result[0] == -1:
        sht.range(_XHBET_ERASEFULLCHIP_PROGRESS).value = "0%"
        sht.range(_XHBET_ERASEFULLCHIP_STATUS).value = "Complete NOK"  
        return False
    
    sht.range(_XHBET_ERASEFULLCHIP_PROGRESS).value = "100%"
    sht.range(_XHBET_ERASEFULLCHIP_STATUS).value = "Erased OK" 
    return True

def ubootUartAccessRemote_XhBet_BackupFlashToFile():
    print("ubootUartAccessRemote_Procedure_SaveFlashToFile, Start")
    
    _XHBET_BACKUP_FULL_FLASH_FILENAME_OFFSET = [5,0]
    _XHBET_BACKUP_FULL_FLASH_ADDRESS_OFFSET = [6,0]
    _XHBET_BACKUP_FULL_FLASH_SIZE_OFFSET = [7,0]    
    _XHBET_BACKUP_FULL_FLASH_PROGRESS_OFFSET = [8,0]
    _XHBET_BACKUP_FULL_FLASH_STATUS_OFFSET = [9,0]

    _XHBET_BACKUP_FULL_FLASH_FILENAME = 'F15'
    _XHBET_BACKUP_FULL_FLASH_ADDRESS = 'G15'
    _XHBET_BACKUP_FULL_FLASH_SIZE = 'H15'    
    _XHBET_BACKUP_FULL_FLASH_PROGRESS = 'I15'
    _XHBET_BACKUP_FULL_FLASH_STATUS = 'J15'
    _XHBET_SYS_ROOT_DIR = 'G2'
    
    wb = xhbet.Book.caller()
    sht = xhbet.sheets[0]
    #curr_time = datetime.datetime.now()
    #time_str = datetime.datetime.strftime(curr_time,'%Y-%m-%d %H:%M:%S')
    
    _XHBET_BACKUP_FULL_FLASH_BASE = XhBet_Find_Position("backup", sht)
    _XHBET_BACKUP_FULL_FLASH_FILENAME = XY2POS(Xhbet_2Dim_Add(_XHBET_BACKUP_FULL_FLASH_BASE, _XHBET_BACKUP_FULL_FLASH_FILENAME_OFFSET))
    _XHBET_BACKUP_FULL_FLASH_ADDRESS = XY2POS(Xhbet_2Dim_Add(_XHBET_BACKUP_FULL_FLASH_BASE, _XHBET_BACKUP_FULL_FLASH_ADDRESS_OFFSET))
    _XHBET_BACKUP_FULL_FLASH_SIZE = XY2POS(Xhbet_2Dim_Add(_XHBET_BACKUP_FULL_FLASH_BASE, _XHBET_BACKUP_FULL_FLASH_SIZE_OFFSET))
    _XHBET_BACKUP_FULL_FLASH_PROGRESS = XY2POS(Xhbet_2Dim_Add(_XHBET_BACKUP_FULL_FLASH_BASE, _XHBET_BACKUP_FULL_FLASH_PROGRESS_OFFSET)) 
    _XHBET_BACKUP_FULL_FLASH_STATUS  =  XY2POS(Xhbet_2Dim_Add(_XHBET_BACKUP_FULL_FLASH_BASE, _XHBET_BACKUP_FULL_FLASH_STATUS_OFFSET))  

    #.................
    #..... START .....
    #.................
    filename = sht.range(_XHBET_SYS_ROOT_DIR).value + sht.range(_XHBET_BACKUP_FULL_FLASH_FILENAME).value
    base_addr = int(sht.range(_XHBET_BACKUP_FULL_FLASH_ADDRESS).value, 16)
    size_in_bytes = int(sht.range(_XHBET_BACKUP_FULL_FLASH_SIZE).value)
    
    result = ubootUartAccessRemote_XhBet_ReadAndSaveToFile(filename, base_addr, size_in_bytes, _XHBET_BACKUP_FULL_FLASH_PROGRESS, _XHBET_BACKUP_FULL_FLASH_STATUS, sht)
    return result    
    
def ubootUartAccessRemote_XhBet_ReadAndSaveToFile(filename, base_addr, size_in_bytes, progress, status, sht):
    
    sht.range(progress).value = "0%"
    sht.range(status).value = "Prepare..."
    
    cuuar = classUbootUartAccessRomote()    
#     sht.range('N15').value = filename
#     sht.range('N16').value = _XHBET_BACKUP_FULL_FLASH_ADDRESS
#     sht.range('N17').value = _XHBET_BACKUP_FULL_FLASH_SIZE
#     sht.range('N18').value = _XHBET_BACKUP_FULL_FLASH_PROGRESS
#     sht.range('N19').value = _XHBET_BACKUP_FULL_FLASH_STATUS
    
    file = b''
    read_flash_offset = int(0)
    next_len_to_read = int(_STM32_MAX_BYTES_TO_READ);
    while(read_flash_offset < size_in_bytes):
        result, hex = cuuar.ubootUartAccessRemote_ReadMemory(base_addr + read_flash_offset, next_len_to_read)
        #print(len(result), result)
        if result == 0 or result == 1 or result == -1 or result == -2:
            sht.range(progress).value = "{0:.1f}".format(100*read_flash_offset/size_in_bytes) +"%"
            sht.range(status).value = "Read NOK"
            return 
            
        read_flash_offset = read_flash_offset + int(len(result) / 2)
        
        if read_flash_offset + _STM32_MAX_BYTES_TO_READ > size_in_bytes:                
            next_len_to_read = int(size_in_bytes - read_flash_offset)
        else:
            next_len_to_read = int(_STM32_MAX_BYTES_TO_READ)
        print("read_flash_offset=", read_flash_offset, ", next_len_to_read=", next_len_to_read, ", progress={:.2f}".format(100*read_flash_offset/size_in_bytes), "%")
        sht.range(progress).value = "{0:.1f}".format(100*read_flash_offset/size_in_bytes) +"%"
        sht.range(status).value = "reading..." 
           
        y = bytearray.fromhex(result)  #https://www.jianshu.com/p/7136b47fdd33
        file = file + y
                    
    #file_int_list = [ord(c) for c in file]
    #print(file)
    fp = open(filename,'w+b')    
    fp.write(file)
    fp.close()
    file_size = GetFileSize(filename)
    #sht.range('M16').value = file_size
    #sht.range('M17').value = os.path._getfullpathname(filename)
    if(file_size == size_in_bytes):
        print("ubootUartAccessRemote_SaveFlashToFile: Save file OK, Saved ", file_size, " Bytes")
        sht.range(progress).value = "{0:.1f}".format(100*read_flash_offset/size_in_bytes) +"%"
        sht.range(status).value = "Saved OK"         
        return True, file_size
    else:
        print("ubootUartAccessRemote_SaveFlashToFile: Save file KO, Saved ", file_size, " Bytes")
        sht.range(progress).value = "{0:.1f}".format(100*read_flash_offset/size_in_bytes) +"%"
        sht.range(status).value = "Saved NOK"         
        return False, file_size   
#     
#     cuuar = classUbootUartAccessRomote()
#     result = cuuar.ubootUartAccessRemote_SaveFlashToFile(filename, base_addr, size_in_byes)
#     print(result)
#     return result              
    


def ubootUartAccessRemote_XhBet_RestoreFlashFromFile():
    print("ubootUartAccessRemote_Procedure_WriteMemoryFromFile, Start")
    
    _XHBET_RESTORE_FULL_FLASH_FILENAME_OFFSET = [5,0]
    _XHBET_RESTORE_FULL_FLASH_ADDRESS_OFFSET = [6,0]
    _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET = [7,0]    
    _XHBET_RESTORE_FULL_FLASH_PROGRESS_OFFSET = [8,0]
    _XHBET_RESTORE_FULL_FLASH_STATUS_OFFSET = [9,0]
    
    _XHBET_RESTORE_FULL_FLASH_FILENAME = 'F16'
    _XHBET_RESTORE_FULL_FLASH_ADDRESS = 'G16'
    _XHBET_RESTORE_FULL_FLASH_SIZE = 'H16'    
    _XHBET_RESTORE_FULL_FLASH_PROGRESS = 'I16'
    _XHBET_RESTORE_FULL_FLASH_STATUS = 'J16'    
    _XHBET_SYS_ROOT_DIR = 'G2'
    
    wb = xhbet.Book.caller()
    sht = xhbet.sheets[0]

    _XHBET_RESTORE_FULL_FLASH_BASE = XhBet_Find_Position("restore", sht)
    _XHBET_RESTORE_FULL_FLASH_FILENAME = XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_FILENAME_OFFSET))
    _XHBET_RESTORE_FULL_FLASH_ADDRESS = XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_ADDRESS_OFFSET))
    _XHBET_RESTORE_FULL_FLASH_SIZE = XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))
    _XHBET_RESTORE_FULL_FLASH_PROGRESS = XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_PROGRESS_OFFSET)) 
    _XHBET_RESTORE_FULL_FLASH_STATUS  =  XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_STATUS_OFFSET))  
    
    #.................
    #..... START .....
    #.................    
    filename = sht.range(_XHBET_SYS_ROOT_DIR).value + sht.range(_XHBET_RESTORE_FULL_FLASH_FILENAME).value
    base_addr = int(sht.range(_XHBET_RESTORE_FULL_FLASH_ADDRESS).value, 16)
    size_in_bytes = int(sht.range(_XHBET_RESTORE_FULL_FLASH_SIZE).value)
    
    result = ubootUartAccessRemote_XhBet_BurnFromFile(filename, base_addr, size_in_bytes, _XHBET_RESTORE_FULL_FLASH_PROGRESS, _XHBET_RESTORE_FULL_FLASH_STATUS, sht)
    return result
  
    
    
def ubootUartAccessRemote_XhBet_BurnFromFile(filename, base_addr, size_in_bytes, progress, status, sht):
    print("ubootUartAccessRemote_Procedure_WriteMemoryFromFile, Start")
    
#     _XHBET_SYS_ROOT_DIR = 'G2'
#     filename = sht.range(_XHBET_SYS_ROOT_DIR).value + sht.range(_XHBET_RESTORE_FULL_FLASH_FILENAME).value
#     base_addr = int(sht.range(_XHBET_RESTORE_FULL_FLASH_ADDRESS).value, 16)
#     size_in_bytes = int(sht.range(_XHBET_RESTORE_FULL_FLASH_SIZE).value)    
    
    sht.range(progress).value = "0%"
    sht.range(status).value = "Read File"    
        
    cuuar = classUbootUartAccessRomote()

    print("ubootUartAccessRemote_WriteMemoryFromFile, ", filename, "Size=", size_in_bytes, "bytes to write at ", base_addr)
    file_size = GetFileSize(filename)
    file_read_list = []    
    
    if file_size > 0:
        fp = open(filename,'r+b')
        file_read_bytes = fp.read()
        size_to_save = min(size_in_bytes, file_size)
        for i in range(size_to_save):
            file_read_list.append(file_read_bytes[i] & 0xFF)
    
    #print(file_read_bytes)
    #print(file_read_list)
    else:
        sht.range(progress).value = "0%"
        sht.range(status).value = "No File" 

#     print("ubootUartAccessRemote_WriteMemoryFromFile, Call ubootUartAccessRemote_WriteMemoryFromList")
#     ret, fb = cuuar.ubootUartAccessRemote_WriteMemoryFromList(base_addr, file_read_list, Verify)
#     print(ret, fb)
#     return ret, fb

    base_addr = base_addr
    byteArray = file_read_list
    Verify = True
    
    total_len_of_array = len(byteArray)
    len_per_write = int(0)
    total_len_of_already_writen = int(0)
    
    print("ubootUartAccessRemote_WriteMemoryFromList", total_len_of_array, " bytes to write at ", base_addr)
    
    if total_len_of_array <= _STM32_MAX_BYTES_TO_WRITE:
        len_per_write = total_len_of_array
    else:
        len_per_write = _STM32_MAX_BYTES_TO_WRITE
    
    #START TO WRITE    
    while (total_len_of_already_writen < total_len_of_array):
        byteSegment = byteArray[total_len_of_already_writen:total_len_of_already_writen+len_per_write]
        
        print("ubootUartAccessRemote_WriteMemoryFromList, addr_offset=", total_len_of_already_writen, "len_per_write=", len_per_write, "lenSeg=", len(byteSegment))
        sht.range(progress).value = "{0:.1f}".format(100*total_len_of_already_writen/total_len_of_array) +"%"
        sht.range(status).value = "Writing..." 
        
        result = cuuar.ubootUartAccessRemote_WriteMemory(base_addr + total_len_of_already_writen, byteSegment)
        
        if result[0] != 121:
            sht.range(progress).value = "{0:.1f}".format(100*total_len_of_already_writen/total_len_of_array) +"%"
            sht.range(status).value = "Write NOK" 
            print("ubootUartAccessRemote_WriteMemoryFromList, Return Error from Server")
            return False, total_len_of_already_writen
        
        total_len_of_already_writen = total_len_of_already_writen + len_per_write
        
        if total_len_of_already_writen + _STM32_MAX_BYTES_TO_WRITE > total_len_of_array:
            len_per_write = total_len_of_array - total_len_of_already_writen
        else:
            len_per_write = _STM32_MAX_BYTES_TO_WRITE
            
    # VERIFICATION CHECK
    if Verify == True:
        print("ubootUartAccessRemote_WriteMemoryFromList, Start verifying ...")
        sht.range(progress).value = "0%"
        sht.range(status).value = "Verifying..." 
        read_len = int(0)
        read_back_str = ''
        read_per_time = int(0)
        while (read_len < total_len_of_array):                
            if (read_len + _STM32_MAX_BYTES_TO_READ) < total_len_of_array:
                read_per_time = _STM32_MAX_BYTES_TO_READ
            else:
                read_per_time = total_len_of_array - read_len
                
            fb, hex = cuuar.ubootUartAccessRemote_ReadMemory(base_addr + read_len, read_per_time)
            #print(fb)
            read_len = read_len + int(len(fb)/2)
            read_back_str = read_back_str + fb
            
            sht.range(progress).value = "{0:.1f}".format(100*read_len/total_len_of_array) +"%"
            sht.range(status).value = "Verifying..." 

           
        read_back_list = list(bytes.fromhex(read_back_str))
        #print(read_back_list)
        
        if (read_back_list == byteArray):
            print("ubootUartAccessRemote_WriteMemoryFromList, Verify OK")
            sht.range(progress).value = "100%"
            sht.range(status).value = "Verify OK"             
            return True, total_len_of_already_writen
        else:
            print("ubootUartAccessRemote_WriteMemoryFromList, Verify NOK")
            sht.range(progress).value = "100%"
            sht.range(status).value = "Verify NOK"             
            return False, total_len_of_already_writen
            
    else: # NO VERIFICATION
        print("ubootUartAccessRemote_WriteMemoryFromList, Completed, No Verify")                      
        return True, total_len_of_already_writen    
    
    
def ubootUartAccessRemote_XhBet_BurnFromHexStr(hexstring, base_addr, size_of_bytes, progress, status, sht):

    print("ubootUartAccessRemote_WriteMemoryFromFile, ", hexstring, "Size=", size_of_bytes, "bytes to write at ", base_addr)
        
    sht.range(progress).value = "0%"
    sht.range(status).value = "Read String"    
        
    cuuar = classUbootUartAccessRomote()
    
    byteArrayZero = bytearray.fromhex(hexstring)
#    file_size = os.path.getsize(filename)
#    file_read_list = []    
    file_read_list = list(byteArrayZero)
#    file_size = len(byteArrayZero)
    
#     if file_size > 0:
#         fp = open(filename,'r+b')
#         file_read_bytes = fp.read()
#         size_to_save = min(size_in_bytes, file_size)
#         for i in range(size_to_save):
#             file_read_list.append(file_read_bytes[i] & 0xFF)
    
    #print(file_read_bytes)
    #print(file_read_list)
#     else:
    sht.range(progress).value = "0%"
    sht.range(status).value = "No File" 

#     print("ubootUartAccessRemote_WriteMemoryFromFile, Call ubootUartAccessRemote_WriteMemoryFromList")
#     ret, fb = cuuar.ubootUartAccessRemote_WriteMemoryFromList(base_addr, file_read_list, Verify)
#     print(ret, fb)
#     return ret, fb

    base_addr = base_addr
    byteArray = file_read_list
    Verify = True
    
    total_len_of_array = len(byteArray)
    len_per_write = int(0)
    total_len_of_already_writen = int(0)
    
    print("ubootUartAccessRemote_WriteMemoryFromList", total_len_of_array, " bytes to write at ", base_addr)
    
    if total_len_of_array <= _STM32_MAX_BYTES_TO_WRITE:
        len_per_write = total_len_of_array
    else:
        len_per_write = _STM32_MAX_BYTES_TO_WRITE
    
    #START TO WRITE    
    while (total_len_of_already_writen < total_len_of_array):
        byteSegment = byteArray[total_len_of_already_writen:total_len_of_already_writen+len_per_write]
        
        print("ubootUartAccessRemote_WriteMemoryFromList, addr_offset=", total_len_of_already_writen, "len_per_write=", len_per_write, "lenSeg=", len(byteSegment))
        sht.range(progress).value = "{0:.1f}".format(100*total_len_of_already_writen/total_len_of_array) +"%"
        sht.range(status).value = "Writing..." 
        
        result = cuuar.ubootUartAccessRemote_WriteMemory(base_addr + total_len_of_already_writen, byteSegment)
        
        if result[0] != 121:
            sht.range(progress).value = "{0:.1f}".format(100*total_len_of_already_writen/total_len_of_array) +"%"
            sht.range(status).value = "Write NOK" 
            print("ubootUartAccessRemote_WriteMemoryFromList, Return Error from Server")
            return False, total_len_of_already_writen
        
        total_len_of_already_writen = total_len_of_already_writen + len_per_write
        
        if total_len_of_already_writen + _STM32_MAX_BYTES_TO_WRITE > total_len_of_array:
            len_per_write = total_len_of_array - total_len_of_already_writen
        else:
            len_per_write = _STM32_MAX_BYTES_TO_WRITE
            
    # VERIFICATION CHECK
    if Verify == True:
        print("ubootUartAccessRemote_WriteMemoryFromList, Start verifying ...")
        sht.range(progress).value = "0%"
        sht.range(status).value = "Verifying..." 
        read_len = int(0)
        read_back_str = ''
        read_per_time = int(0)
        while (read_len < total_len_of_array):                
            if (read_len + _STM32_MAX_BYTES_TO_READ) < total_len_of_array:
                read_per_time = _STM32_MAX_BYTES_TO_READ
            else:
                read_per_time = total_len_of_array - read_len
                
            fb, hex = cuuar.ubootUartAccessRemote_ReadMemory(base_addr + read_len, read_per_time)
            #print(fb)
            read_len = read_len + int(len(fb)/2)
            read_back_str = read_back_str + fb
            
            sht.range(progress).value = "{0:.1f}".format(100*read_len/total_len_of_array) +"%"
            sht.range(status).value = "Verifying..." 

           
        read_back_list = list(bytes.fromhex(read_back_str))
        #print(read_back_list)
        
        if (read_back_list == byteArray):
            print("ubootUartAccessRemote_WriteMemoryFromList, Verify OK")
            sht.range(progress).value = "100%"
            sht.range(status).value = "Verify OK"             
            return True, total_len_of_already_writen
        else:
            print("ubootUartAccessRemote_WriteMemoryFromList, Verify NOK")
            sht.range(progress).value = "100%"
            sht.range(status).value = "Verify NOK"             
            return False, total_len_of_already_writen
            
    else: # NO VERIFICATION
        print("ubootUartAccessRemote_WriteMemoryFromList, Completed, No Verify")                      
        return True, total_len_of_already_writen    
     
     
def ubootUartAccessRemote_XhBet_BurnWithMultipleLine(): 

    _XHBET_RESTORE_FULL_FLASH_WRITE_OFFSET = [2,0]
    _XHBET_RESTORE_FULL_FLASH_TYPE_OFFSET = [3,0]
    _XHBET_RESTORE_FULL_FLASH_FILENAME_OFFSET = [5,0]
    _XHBET_RESTORE_FULL_FLASH_ADDRESS_OFFSET = [6,0]
    _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET = [7,0]    
    _XHBET_RESTORE_FULL_FLASH_PROGRESS_OFFSET = [8,0]
    _XHBET_RESTORE_FULL_FLASH_STATUS_OFFSET = [9,0]
    _XHBET_SYS_ROOT_DIR = 'G2'    
            
    wb = xhbet.Book.caller()
    sht = xhbet.sheets[0]

    for i in range(9):
        _XHBET_RESTORE_FULL_FLASH_BASE = XhBet_Find_Position("burn" + str(i+1), sht)
        write_or_not = sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_WRITE_OFFSET))).value
        input_type = sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_TYPE_OFFSET))).value
        filename_or_hexstring = sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_FILENAME_OFFSET))).value
        base_addr = int(sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_ADDRESS_OFFSET))).value, 16)
        size_in_bytes = sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))).value
        progress = XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_PROGRESS_OFFSET))
        status = XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_STATUS_OFFSET))
        
        sht.range('N22').value = write_or_not
        sht.range('N23').value = input_type
        sht.range('N24').value = filename_or_hexstring
        sht.range('N25').value = base_addr
        sht.range('N26').value = size_in_bytes
        
        #time.sleep(3)
        if write_or_not == 1:
            if input_type == 'F':
                filename = sht.range(_XHBET_SYS_ROOT_DIR).value + filename_or_hexstring
                file_size = GetFileSize(filename)
                sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))).value = str(file_size)
                size_in_bytes = int(sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))).value)
                
                ubootUartAccessRemote_XhBet_BurnFromFile(filename, base_addr, size_in_bytes, progress, status, sht)
                
            elif input_type == 'S':
                hexstring = filename_or_hexstring
                file_size = int(len(hexstring)/2)
                sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))).value = str(file_size)
                size_in_bytes = int(sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))).value)
                
                ubootUartAccessRemote_XhBet_BurnFromHexStr(hexstring, base_addr, size_in_bytes, progress, status, sht)         
            
            else:
                continue
            
def ubootUartAccessRemote_XhBet_CheckFileLength(): 

    _XHBET_SYS_ROOT_DIR = 'G2'    
    _XHBET_SYS_FILENAME_IAP = 'G80'
    _XHBET_SYS_FILENAME_FACTORY_LOAD = 'G81'
    _XHBET_SYS_FILENAME_APP1_LOAD = 'G82'
    _XHBET_SYS_FILENAME_APP2_LOAD = 'G83'
    
    _XHBET_SYS_FILESIZE_IAP = 'H61'
    _XHBET_SYS_FILESIZE_FACTORY_LOAD = 'H56'
    _XHBET_SYS_FILESIZE_APP1_LOAD = 'H66'
    _XHBET_SYS_FILESIZE_APP2_LOAD = 'H71'
    
    _XHBET_SYS_CHECK_FILE_LEGNTH_STATUS = 'K81'
    
    _XHBET_SYS_FILELABEL_IAP = LEFT_OF_POS(_XHBET_SYS_FILESIZE_IAP)
    _XHBET_SYS_FILELABEL_FACTORY_LOAD = LEFT_OF_POS(_XHBET_SYS_FILESIZE_FACTORY_LOAD)
    _XHBET_SYS_FILELABEL_APP1_LOAD = LEFT_OF_POS(_XHBET_SYS_FILESIZE_APP1_LOAD)
    _XHBET_SYS_FILELABEL_APP2_LOAD = LEFT_OF_POS(_XHBET_SYS_FILESIZE_APP2_LOAD)
    
    _XHBET_SYS_FILELABEL_IAP_CONTENT = 'iapLoadLen;'
    _XHBET_SYS_FILELABEL_FACTORY_LOAD_CONTENT = 'facLoadLen;'
    _XHBET_SYS_FILELABEL_APP1_LOAD_CONTENT = 'app1LoadLen;'
    _XHBET_SYS_FILELABEL_APP2_LOAD_CONTENT = 'app2LoadLen;'
    
    wb = xhbet.Book.caller()
    sht = xhbet.sheets[0]
    
    sht.range(_XHBET_SYS_CHECK_FILE_LEGNTH_STATUS).value = "Start..."
    
    # IAP
    filename = sht.range(_XHBET_SYS_ROOT_DIR).value + sht.range(_XHBET_SYS_FILENAME_IAP).value
    sht.range('N80').value = filename
    filesize = GetFileSize(filename)
        
    sht.range('P80').value = filesize
    if sht.range(_XHBET_SYS_FILELABEL_IAP).value == _XHBET_SYS_FILELABEL_IAP_CONTENT:
        sht.range(_XHBET_SYS_FILESIZE_IAP).value = filesize
        
    # FACTORY_LOAD
    filename = sht.range(_XHBET_SYS_ROOT_DIR).value + sht.range(_XHBET_SYS_FILENAME_FACTORY_LOAD).value
    sht.range('N81').value = filename
    filesize = GetFileSize(filename)
    sht.range('P81').value = filesize    
    if sht.range(_XHBET_SYS_FILELABEL_FACTORY_LOAD).value == _XHBET_SYS_FILELABEL_FACTORY_LOAD_CONTENT:
        sht.range(_XHBET_SYS_FILESIZE_FACTORY_LOAD).value = filesize
    
    # APP1_LOAD
    filename = sht.range(_XHBET_SYS_ROOT_DIR).value + sht.range(_XHBET_SYS_FILENAME_APP1_LOAD).value
    sht.range('N82').value = filename
    filesize = GetFileSize(filename)
    sht.range('P82').value = filesize
    if sht.range(_XHBET_SYS_FILELABEL_APP1_LOAD).value == _XHBET_SYS_FILELABEL_APP1_LOAD_CONTENT:
        sht.range(_XHBET_SYS_FILESIZE_APP1_LOAD).value = filesize    
    
    # APP2_LOAD
    filename = sht.range(_XHBET_SYS_ROOT_DIR).value + sht.range(_XHBET_SYS_FILENAME_APP2_LOAD).value
    sht.range('N83').value = filename
    filesize = GetFileSize(filename)
    sht.range('P83').value = filesize
    if sht.range(_XHBET_SYS_FILELABEL_APP2_LOAD).value == _XHBET_SYS_FILELABEL_APP2_LOAD_CONTENT:
        sht.range(_XHBET_SYS_FILESIZE_APP2_LOAD).value = filesize
        
    sht.range(_XHBET_SYS_CHECK_FILE_LEGNTH_STATUS).value = "Check OK"        


def ubootUartAccessRemote_XhBet_ReadAndReturnAsHexStr(base_addr, size_in_bytes, progress, status, sht):
    
    sht.range(progress).value = "0%"
    sht.range(status).value = "Prepare"
    
    cuuar = classUbootUartAccessRomote()    
#     sht.range('N15').value = filename
#     sht.range('N16').value = _XHBET_BACKUP_FULL_FLASH_ADDRESS
#     sht.range('N17').value = _XHBET_BACKUP_FULL_FLASH_SIZE
#     sht.range('N18').value = _XHBET_BACKUP_FULL_FLASH_PROGRESS
#     sht.range('N19').value = _XHBET_BACKUP_FULL_FLASH_STATUS
    
    file = ""
    read_flash_offset = int(0)
    next_len_to_read = int(_STM32_MAX_BYTES_TO_READ);    
    if next_len_to_read > size_in_bytes:
        next_len_to_read = size_in_bytes
        
    sht.range('N95').value = next_len_to_read
    
    while(read_flash_offset < size_in_bytes):
        result, hex = cuuar.ubootUartAccessRemote_ReadMemory(base_addr + read_flash_offset, next_len_to_read)
        #print(len(result), result)
        if result == 0 or result == 1 or result == -1 or result == -2:
            sht.range(progress).value = "{0:.1f}".format(100*read_flash_offset/size_in_bytes) +"%"
            sht.range(status).value = "Read NOK"
            return 
            
        read_flash_offset = read_flash_offset + int(len(result) / 2)
        
        if read_flash_offset + _STM32_MAX_BYTES_TO_READ > size_in_bytes:                
            next_len_to_read = int(size_in_bytes - read_flash_offset)
        else:
            next_len_to_read = int(_STM32_MAX_BYTES_TO_READ)
        print("read_flash_offset=", read_flash_offset, ", next_len_to_read=", next_len_to_read, ", progress={:.2f}".format(100*read_flash_offset/size_in_bytes), "%")
        sht.range(progress).value = "{0:.1f}".format(100*read_flash_offset/size_in_bytes) +"%"
        sht.range(status).value = "Reading..." 
           
        #y = bytearray.fromhex(result)  #https://www.jianshu.com/p/7136b47fdd33
        #file = file + y
        file = file + result
    
    sht.range('N96').value = len(file)/2
    if len(file)/2 == size_in_bytes:
        sht.range(progress).value = "{0:.1f}".format(100*read_flash_offset/size_in_bytes) +"%"
        sht.range(status).value = "Read OK"
    else:
        sht.range(progress).value = "{0:.1f}".format(100*read_flash_offset/size_in_bytes) +"%"
        sht.range(status).value = "Read NOK"        
    
    return file
            
def ubootUartAccessRemote_XhBet_ReadAndSaveWithMultipleLine(): 

    _XHBET_RESTORE_FULL_FLASH_WRITE_OFFSET = [2,0]
    _XHBET_RESTORE_FULL_FLASH_TYPE_OFFSET = [3,0]
    _XHBET_RESTORE_FULL_FLASH_FILENAME_OFFSET = [5,0]
    _XHBET_RESTORE_FULL_FLASH_ADDRESS_OFFSET = [6,0]
    _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET = [7,0]    
    _XHBET_RESTORE_FULL_FLASH_PROGRESS_OFFSET = [8,0]
    _XHBET_RESTORE_FULL_FLASH_STATUS_OFFSET = [9,0]
    _XHBET_SYS_ROOT_DIR = 'G2'    
            
    wb = xhbet.Book.caller()
    sht = xhbet.sheets[0]

    for i in range(9):
        
        _XHBET_RESTORE_FULL_FLASH_BASE = XhBet_Find_Position("read" + str(i+1), sht)
        
        write_or_not = sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_WRITE_OFFSET))).value
        input_type = sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_TYPE_OFFSET))).value
        filename_or_hexstring = sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_FILENAME_OFFSET))).value
        base_addr = int(sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_ADDRESS_OFFSET))).value, 16)
        size_in_bytes = sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))).value
        progress = XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_PROGRESS_OFFSET))
        status = XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_STATUS_OFFSET))
        
        sht.range('N89').value = write_or_not
        sht.range('N90').value = input_type
        sht.range('N91').value = filename_or_hexstring
        sht.range('N92').value = base_addr
        sht.range('N93').value = size_in_bytes
        
        #time.sleep(3)
        if write_or_not == 1:
            if input_type == 'F':
                filename = sht.range(_XHBET_SYS_ROOT_DIR).value + filename_or_hexstring
                #file_size = GetFileSize(filename)
                #sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))).value = str(file_size)
                size_in_bytes = int(sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))).value)
                
                ubootUartAccessRemote_XhBet_ReadAndSaveToFile(filename, base_addr, size_in_bytes, progress, status, sht)
                
            elif input_type == 'S':
                hexstring = filename_or_hexstring
                #file_size = int(len(hexstring)/2)
                #sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))).value = str(file_size)
                size_in_bytes = int(sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_SIZE_OFFSET))).value)
                
                hexstring = ubootUartAccessRemote_XhBet_ReadAndReturnAsHexStr(base_addr, size_in_bytes, progress, status, sht)         
                sht.range(XY2POS(Xhbet_2Dim_Add(_XHBET_RESTORE_FULL_FLASH_BASE, _XHBET_RESTORE_FULL_FLASH_FILENAME_OFFSET))).value = hexstring
                sht.range('N93').value = hexstring
            
            else:
                continue
            
            
if __name__ == '__main__':
#     fb = b'y\x0b1\x00\x01\x02\x11!1Dcs\x82\x92y'
#     print(fb)
#     print(len(fb))
#     print(range(len(fb[0:])))
#     print(binascii.b2a_hex(fb))
#     print(binascii.b2a_hex(fb).decode('utf-8'))
#     test_str = binascii.b2a_hex(fb).decode('utf-8')
#     print(type(test_str))
#     print(str(binascii.b2a_hex(fb)))
    #print(str(binascii.b2a_hex(fb)).decode('utf-8'))
#     fb = b'y\xff'
#     resByte=binascii.b2a_hex(fb[1:]).decode('utf-8')
#     #for i in range(len( fb[1:])):
#         #tmp = struct.unpack('>B',fb[i+1])
#         #resByte += [tmp]
#     print(resByte)
#     hex = '790b31000102112131446373829279'
#     cmd = hex[18:20]
#     print(hex, cmd)
            
#     cuuar = classUbootUartAccessRomote()
#     result = cuuar.ubootUartAccessRemote_StartUboot()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_Get()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_GetID()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_ReadoutUnprotect()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_StartUboot()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
#     print(result)          
#     result = cuuar.ubootUartAccessRemote_Go(0x8000000)
#     print(result)
#         result = cuuar.ubootUartAccessRemote_ReadoutProtect()
#         print(result)
#         result = cuuar.ubootUartAccessRemote_StartUboot()
#         print(result)
#         time.sleep(3)
#         result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
#         print(result)
#     result = cuuar.ubootUartAccessRemote_ReadoutUnprotect()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_StartUboot()
#     print(result)     
#     result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_WriteProtect([1,2])
#     print(result)
#     result = cuuar.ubootUartAccessRemote_StartUboot()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_WriteUnprotect()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_StartUboot()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_GetVersionRDPStatus()
#     print(result)
    
#    cuuar.ubootUartAccessRemote_SaveFlashToFile("test2.bin", 0x8000000, 16*1024)
    
#     result = cuuar.ubootUartAccessRemote_EraseFullChip()
#     print(result)
#     time.sleep(10)
#     result = cuuar.ubootUartAccessRemote_WriteUnprotect()
#     print(result)
#     result = cuuar.ubootUartAccessRemote_StartUboot()
#     print(result)  
#     result = cuuar.ubootUartAccessRemote_Erase():
#     print(result)
#     result = cuuar.ubootUartAccessRemote_ExtendedErase():
#     print(result)
#     WriteAddr = 0x8000000
    #result = cuuar.ubootUartAccessRemote_WriteMemory(WriteAddr+256, list(range(256)))
    #result = cuuar.ubootUartAccessRemote_WriteMemoryFromList(WriteAddr, list(range(1024)), Verify=True)
    #time.sleep(5)
#     result = cuuar.ubootUartAccessRemote_WriteMemoryFromFile('test.bin', WriteAddr, 16384, True)
#     print(result)

#     result = cuuar.ubootUartAccessRemote_Go(0x8000000)
#     print(result)
#    read_len = int(0)
#    while (read_len < _STM32_MAX_BYTES_TO_READ):
#        result, hex = cuuar.ubootUartAccessRemote_ReadMemory(WriteAddr + 256 + read_len, 255 - read_len)
#        print(result)
#        read_len = read_len + int(len(result)/2)
#        print("read_len=", read_len)
#     print(result)
#     result = cuuar.ubootUartAccessRemote_EnterBootload(self):
#     print(result)
    
    ##########################################
    ########### TEST PROCUDRE !!!!! ##########
    ##########################################
      
    result = ubootUartAccessRemote_Procedure_Connect()
    print(result)
     
    result = ubootUartAccessRemote_Procedure_EraseFullChip()
    print(result)
    
    result = ubootUartAccessRemote_Procedure_ErasePages([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    print(result)    
     
    result = ubootUartAccessRemote_Procedure_WriteMemoryFromFile('test.bin', 0x8000000, 16384)
    print(result)
    
    result = ubootUartAccessRemote_Procedure_SaveFlashToFile('test_read.bin', 0x8000000, 16384)
    print(result)
    
    result = ubootUartAccessRemote_Procedure_ReadMemory(0x8000000, 16384)
    print(result)
    
    
    