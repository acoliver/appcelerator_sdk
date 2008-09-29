<?php
/**
 * Zend Framework
 *
 * LICENSE
 *
 * This source file is subject to version 1.0 of the Zend Framework
 * license, that is bundled with this package in the file LICENSE.txt, and
 * is available through the world-wide-web at the following URL:
 * http://framework.zend.com/license/new-bsd. If you did not receive
 * a copy of the Zend Framework license and are unable to obtain it
 * through the world-wide-web, please send a note to license@zend.com
 * so we can mail you a copy immediately.
 *
 * @category   Zend
 * @package    Zend_Controller
 * @subpackage Action_Helper
 * @copyright  Copyright (c) 2005-2008 Zend Technologies USA Inc. (http://www.zend.com)
 * @version    $Id: Abstract.php 8064 2008-02-16 10:58:39Z thomas $
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */

/** Zend_Controller_Action_Helper_Abstract */
require_once 'Zend/Controller/Action/Helper/Abstract.php';

/**
 * Create and send autocompletion lists
 *
 * @uses       Zend_Controller_Action_Helper_Abstract
 * @category   Zend
 * @package    Zend_Controller
 * @subpackage Action_Helper
 * @copyright  Copyright (c) 2005-2008 Zend Technologies USA Inc. (http://www.zend.com)
 * @license    http://framework.zend.com/license/new-bsd     New BSD License
 */
abstract class Zend_Controller_Action_Helper_AutoComplete_Abstract extends Zend_Controller_Action_Helper_Abstract
{
    /**
     * Suppress exit when sendJson() called
     * @var bool
     */
    public $suppressExit = false;

    /**
     * Validate autocompletion data
     * 
     * @param  mixed $data 
     * @return bool
     */
    abstract public function validateData($data);

    /**
     * Prepare autocompletion data
     * 
     * @param  mixed $data 
     * @param  bool $keepLayouts 
     * @return mixed
     */
    abstract public function prepareAutoCompletion($data, $keepLayouts = false);

    /**
     * Disable layouts and view renderer
     * 
     * @return Zend_Controller_Action_Helper_AutoComplete_Abstract
     */
    public function disableLayouts()
    {
        require_once 'Zend/Layout.php';
        if (null !== ($layout = Zend_Layout::getMvcInstance())) {
            $layout->disableLayout();
        }

        Zend_Controller_Action_HelperBroker::getStaticHelper('viewRenderer')->setNoRender(true);

        return $this;
    }

    /**
     * Encode data to JSON
     * 
     * @param  mixed $data 
     * @param  bool $keepLayouts 
     * @return string
     * @throws Zend_Controller_Action_Exception
     */
    public function encodeJson($data, $keepLayouts = false)
    {
        if ($this->validateData($data)) {
            return Zend_Controller_Action_HelperBroker::getStaticHelper('Json')->encodeJson($data, $keepLayouts);
        }

        require_once 'Zend/Controller/Action/Exception.php';
        throw new Zend_Controller_Action_Exception('Invalid data passed for autocompletion');
    }

    /**
     * Send autocompletion data
     *
     * Calls prepareAutoCompletion, populates response body with this 
     * information, and sends response.
     * 
     * @param  mixed $data 
     * @param  bool $keepLayouts 
     * @return string|void
     */
    public function sendAutoCompletion($data, $keepLayouts = false)
    {
        $data = $this->prepareAutoCompletion($data, $keepLayouts);

        $response = $this->getResponse();
        $response->setBody($data);

        if (!$this->suppressExit) {
            $response->sendResponse();
            exit;
        }

        return $data;
    }

    /**
     * Strategy pattern: allow calling helper as broker method
     *
     * Prepares autocompletion data and, if $sendNow is true, immediately sends 
     * response.
     * 
     * @param  mixed $data 
     * @param  bool $sendNow 
     * @param  bool $keepLayouts 
     * @return string|void
     */
    public function direct($data, $sendNow = true, $keepLayouts = false)
    {
        if ($sendNow) {
            return $this->sendAutoCompletion($data, $keepLayouts);
        }

        return $this->prepareAutoCompletion($data, $keepLayouts);
    }
}
